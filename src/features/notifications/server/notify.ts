import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import type { NotificationCategory } from "../types";

type AdminClient = ReturnType<typeof createAdminClient>;

export interface NotifyInput {
  category: NotificationCategory;
  title: string;
  body?: string;
  link?: string;
  type?: "info" | "success" | "warning" | "destructive";
  /** When set, de-duplicates per user so re-running a scan won't spam. */
  dedupeKey?: string;
}

/** Email delivery stub — the wire-in point for Resend/SMTP/edge cron. */
function notifyEmail(userId: string, input: NotifyInput) {
  logger.info("Email notification", {
    userId,
    category: input.category,
    title: input.title,
  });
}

/** Resolve active profile ids whose role grants `permissionKey`. */
export async function getUsersWithPermission(
  admin: AdminClient,
  permissionKey: string,
): Promise<string[]> {
  const { data: perm } = await admin
    .from("permissions")
    .select("id")
    .eq("key", permissionKey)
    .maybeSingle();
  if (!perm) return [];
  const { data: rp } = await admin
    .from("role_permissions")
    .select("role_id")
    .eq("permission_id", perm.id);
  const roleIds = [...new Set((rp ?? []).map((r) => r.role_id))];
  if (roleIds.length === 0) return [];
  const { data: profs } = await admin
    .from("profiles")
    .select("id")
    .in("role_id", roleIds)
    .eq("status", "active")
    .is("deleted_at", null);
  return (profs ?? []).map((p) => p.id);
}

/**
 * Create a notification for a set of users, honoring per-user channel
 * preferences and de-duplicating by `dedupeKey`. Returns how many in-app and
 * email notifications were dispatched.
 */
export async function notifyUsers(
  userIds: string[],
  input: NotifyInput,
): Promise<{ inApp: number; email: number }> {
  const recipients = [...new Set(userIds)].filter(Boolean);
  if (recipients.length === 0) return { inApp: 0, email: 0 };
  const admin = createAdminClient();

  const { data: prefs } = await admin
    .from("notification_preferences")
    .select("user_id, in_app, email")
    .in("user_id", recipients)
    .eq("category", input.category);
  const prefMap = new Map(
    (prefs ?? []).map((p) => [p.user_id, { inApp: p.in_app, email: p.email }]),
  );
  const inAppOk = (u: string) => prefMap.get(u)?.inApp ?? true;
  const emailOk = (u: string) => prefMap.get(u)?.email ?? true;

  let targets = recipients.filter(inAppOk);

  // De-dupe: skip users who already have this event.
  if (input.dedupeKey && targets.length) {
    const { data: existing } = await admin
      .from("notifications")
      .select("user_id")
      .eq("dedupe_key", input.dedupeKey)
      .in("user_id", targets);
    const seen = new Set((existing ?? []).map((e) => e.user_id));
    targets = targets.filter((u) => !seen.has(u));
  }

  if (targets.length) {
    const rows = targets.map((user_id) => ({
      user_id,
      category: input.category,
      type: input.type ?? "info",
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      dedupe_key: input.dedupeKey ?? null,
    }));
    const { error } = await admin.from("notifications").insert(rows);
    if (error) logger.error("notifyUsers insert failed", { error: error.message });
  }

  let email = 0;
  for (const u of targets) {
    if (emailOk(u)) {
      notifyEmail(u, input);
      email += 1;
    }
  }
  return { inApp: targets.length, email };
}

/** Convenience: notify a single user (no dedupe by default). */
export async function notifyUser(userId: string, input: NotifyInput) {
  return notifyUsers([userId], input);
}
