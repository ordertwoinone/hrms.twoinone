"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/types/common";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission, AuthorizationError } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { daysUntil } from "../constants";
import { getUsersWithPermission, notifyUsers } from "../server/notify";
import type { NotificationCategory } from "../types";

type AdminClient = ReturnType<typeof createAdminClient>;
type Emp = { first_name: string; last_name: string } | null;

const todayISO = () => new Date().toISOString().slice(0, 10);
const plusDaysISO = (d: number) =>
  new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);

export async function markNotificationRead(id: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const admin = createAdminClient();
    await admin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);
    revalidatePath(ROUTES.notifications);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to update notification." };
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const admin = createAdminClient();
    await admin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    revalidatePath(ROUTES.notifications);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to update notifications." };
  }
}

export async function updateNotificationPreference(
  category: string,
  channel: "in_app" | "email",
  enabled: boolean,
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("notification_preferences")
      .select("in_app, email")
      .eq("user_id", user.id)
      .eq("category", category)
      .maybeSingle();
    const next = {
      user_id: user.id,
      category,
      in_app: channel === "in_app" ? enabled : (existing?.in_app ?? true),
      email: channel === "email" ? enabled : (existing?.email ?? true),
    };
    const { error } = await admin
      .from("notification_preferences")
      .upsert(next, { onConflict: "user_id,category" });
    if (error) return { success: false, error: error.message };
    revalidatePath(ROUTES.notifications);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to update preference." };
  }
}

// ── Generation engine ──
type ExpiryTable =
  | "visas"
  | "passports"
  | "medical_insurance_policies"
  | "contracts"
  | "emirates_ids"
  | "labour_cards"
  | "employee_documents";

async function scanExpiry(
  admin: AdminClient,
  recipients: string[],
  opts: {
    table: ExpiryTable;
    dateCol: string;
    category: NotificationCategory;
    label: string;
    link: string;
    statuses?: string[];
  },
): Promise<number> {
  const today = todayISO();
  const in30 = plusDaysISO(30);
  let query = admin
    .from(opts.table)
    .select(`id, ${opts.dateCol}, employee:employees(first_name, last_name)`)
    .is("deleted_at", null)
    .gte(opts.dateCol, today)
    .lte(opts.dateCol, in30);
  if (opts.statuses) query = query.in("status", opts.statuses);
  const { data } = await query;

  let created = 0;
  for (const raw of (data ?? []) as unknown[]) {
    const row = raw as { id: string; employee: Emp } & Record<
      string,
      string | null
    >;
    const exp = row[opts.dateCol];
    if (!exp) continue;
    const days = daysUntil(exp);
    const name = row.employee
      ? `${row.employee.first_name} ${row.employee.last_name}`
      : "An employee";
    const res = await notifyUsers(recipients, {
      category: opts.category,
      type: days <= 7 ? "destructive" : "warning",
      title: `${opts.label} expiring in ${days} day${days === 1 ? "" : "s"}`,
      body: `${name}'s ${opts.label.toLowerCase()} expires on ${exp}.`,
      link: opts.link,
      dedupeKey: `${opts.category}:${row.id}:${exp}`,
    });
    created += res.inApp;
  }
  return created;
}

async function scanPeopleEvents(
  admin: AdminClient,
  recipients: string[],
): Promise<number> {
  const now = new Date();
  const mmdd = `${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(
    now.getUTCDate(),
  ).padStart(2, "0")}`;
  const year = now.getUTCFullYear();

  const { data } = await admin
    .from("employees")
    .select("id, first_name, last_name, date_of_birth, date_of_joining")
    .is("deleted_at", null)
    .eq("status", "active");

  let created = 0;
  for (const e of data ?? []) {
    const name = `${e.first_name} ${e.last_name}`;
    if (e.date_of_birth && e.date_of_birth.slice(5) === mmdd) {
      const res = await notifyUsers(recipients, {
        category: "birthday",
        type: "info",
        title: `🎂 ${name}'s birthday today`,
        body: `Wish ${e.first_name} a happy birthday!`,
        link: `${ROUTES.employees}/${e.id}`,
        dedupeKey: `birthday:${e.id}:${year}`,
      });
      created += res.inApp;
    }
    if (e.date_of_joining && e.date_of_joining.slice(5) === mmdd) {
      const years = year - Number(e.date_of_joining.slice(0, 4));
      if (years >= 1) {
        const res = await notifyUsers(recipients, {
          category: "work_anniversary",
          type: "info",
          title: `🎉 ${name} — ${years} year work anniversary`,
          body: `${e.first_name} completes ${years} year${years === 1 ? "" : "s"} today.`,
          link: `${ROUTES.employees}/${e.id}`,
          dedupeKey: `work_anniversary:${e.id}:${year}`,
        });
        created += res.inApp;
      }
    }
  }
  return created;
}

/**
 * Scan for expiring documents and today's people events, creating notifications
 * for HR recipients (idempotent via dedupe keys). Designed to be run daily by a
 * scheduled edge function, or manually from the Notification Center.
 */
export async function runNotificationScan(): Promise<
  ActionResult<{ created: number }>
> {
  try {
    await assertPermission(PERMISSIONS.NOTIFICATION_MANAGE);
    const admin = createAdminClient();
    const hr = await getUsersWithPermission(admin, PERMISSIONS.EMPLOYEE_UPDATE);
    if (hr.length === 0) {
      return { success: true, data: { created: 0 } };
    }

    let created = 0;
    created += await scanExpiry(admin, hr, {
      table: "visas",
      dateCol: "expiry_date",
      category: "visa_expiry",
      label: "Visa",
      link: ROUTES.visas,
      statuses: ["active", "in_process"],
    });
    created += await scanExpiry(admin, hr, {
      table: "passports",
      dateCol: "expiry_date",
      category: "passport_expiry",
      label: "Passport",
      link: ROUTES.passports,
      statuses: ["active", "in_process"],
    });
    created += await scanExpiry(admin, hr, {
      table: "medical_insurance_policies",
      dateCol: "expiry_date",
      category: "insurance_expiry",
      label: "Medical insurance",
      link: ROUTES.medicalInsurance,
      statuses: ["active", "in_process"],
    });
    created += await scanExpiry(admin, hr, {
      table: "contracts",
      dateCol: "end_date",
      category: "contract_expiry",
      label: "Contract",
      link: ROUTES.contracts,
      statuses: ["active"],
    });
    created += await scanExpiry(admin, hr, {
      table: "emirates_ids",
      dateCol: "expiry_date",
      category: "document_expiry",
      label: "Emirates ID",
      link: ROUTES.emiratesIds,
      statuses: ["active", "in_process"],
    });
    created += await scanExpiry(admin, hr, {
      table: "labour_cards",
      dateCol: "expiry_date",
      category: "document_expiry",
      label: "Labour card",
      link: ROUTES.labourCards,
      statuses: ["active", "in_process"],
    });
    created += await scanExpiry(admin, hr, {
      table: "employee_documents",
      dateCol: "expiry_date",
      category: "document_expiry",
      label: "Document",
      link: ROUTES.employees,
    });
    created += await scanPeopleEvents(admin, hr);

    revalidatePath(ROUTES.notifications);
    return { success: true, data: { created } };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to run the notification scan." };
  }
}
