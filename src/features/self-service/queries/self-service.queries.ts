import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getLeaveBalances } from "@/features/leave/queries/leave.queries";
import { MONTHS } from "../constants";
import type {
  EssProfile,
  SelfServiceData,
} from "../types";

const num = (v: unknown) => Number(v ?? 0);

type AdminClient = ReturnType<typeof createAdminClient>;

const EMP_SELECT =
  "id, employee_code, first_name, last_name, work_email, personal_email, phone, gender, marital_status, date_of_joining, status, photo_url, address_line, city, country, department:departments(name), designation:designations(name), branch:branches(name)";

type EmpRow = {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  work_email: string | null;
  personal_email: string | null;
  phone: string | null;
  gender: string | null;
  marital_status: string | null;
  date_of_joining: string | null;
  status: string;
  photo_url: string | null;
  address_line: string | null;
  city: string | null;
  country: string | null;
  department: { name: string } | null;
  designation: { name: string } | null;
  branch: { name: string } | null;
};

function toProfile(e: EmpRow): EssProfile {
  return {
    id: e.id,
    code: e.employee_code,
    fullName: `${e.first_name} ${e.last_name}`,
    workEmail: e.work_email,
    personalEmail: e.personal_email,
    phone: e.phone,
    gender: e.gender,
    maritalStatus: e.marital_status,
    dateOfJoining: e.date_of_joining,
    status: e.status,
    photoUrl: e.photo_url,
    addressLine: e.address_line,
    city: e.city,
    country: e.country,
    department: e.department?.name ?? null,
    designation: e.designation?.name ?? null,
    branch: e.branch?.name ?? null,
  };
}

/**
 * Resolve the employee record for a signed-in user: by explicit `user_id` link,
 * falling back to a work/personal email match (which backfills the link).
 */
export async function resolveCurrentEmployee(user: {
  id: string;
  email: string;
}): Promise<EmpRow | null> {
  const admin = createAdminClient();

  const { data: linked } = await admin
    .from("employees")
    .select(EMP_SELECT)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (linked) return linked as EmpRow;

  if (!user.email) return null;
  const { data: byEmail } = await admin
    .from("employees")
    .select(EMP_SELECT)
    .or(`work_email.eq.${user.email},personal_email.eq.${user.email}`)
    .is("deleted_at", null)
    .maybeSingle();
  if (byEmail) {
    await admin
      .from("employees")
      .update({ user_id: user.id })
      .eq("id", (byEmail as EmpRow).id);
    return byEmail as EmpRow;
  }
  return null;
}

async function getAnnouncementsAndNotifications(
  admin: AdminClient,
  userId: string,
) {
  const [{ data: announcements }, { data: notifications }] = await Promise.all([
    admin
      .from("announcements")
      .select("id, title, body, pinned, published_at")
      .is("deleted_at", null)
      .eq("status", "published")
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(20),
    admin
      .from("notifications")
      .select("id, title, body, type, link, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  const notifs = (notifications ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    link: n.link,
    readAt: n.read_at,
    createdAt: n.created_at,
  }));
  return {
    announcements: (announcements ?? []).map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      pinned: a.pinned,
      publishedAt: a.published_at,
    })),
    notifications: notifs,
    unreadCount: notifs.filter((n) => !n.readAt).length,
  };
}

export async function getSelfServiceData(user: {
  id: string;
  email: string;
}): Promise<SelfServiceData> {
  const admin = createAdminClient();
  const emp = await resolveCurrentEmployee(user);
  const feed = await getAnnouncementsAndNotifications(admin, user.id);

  if (!emp) {
    return {
      profile: null,
      leaveBalances: [],
      leaveRequests: [],
      attendance: [],
      payslips: [],
      documents: [],
      letters: [],
      leaveTypes: [],
      ...feed,
    };
  }

  const year = new Date().getFullYear();
  const [
    leaveBalances,
    { data: leaveRows },
    { data: attRows },
    { data: slipRows },
    { data: docRows },
    { data: letterRows },
    { data: typeRows },
  ] = await Promise.all([
    getLeaveBalances(emp.id, year),
    admin
      .from("leave_requests")
      .select("id, start_date, end_date, total_days, status, leave_type:leave_types(name)")
      .eq("employee_id", emp.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("attendance")
      .select("attendance_date, status, work_minutes, late_minutes")
      .eq("employee_id", emp.id)
      .is("deleted_at", null)
      .order("attendance_date", { ascending: false })
      .limit(60),
    admin
      .from("payslips")
      .select(
        "*, run:payroll_runs(period_year, period_month, status)",
      )
      .eq("employee_id", emp.id)
      .order("created_at", { ascending: false }),
    admin
      .from("employee_documents")
      .select("id, title, category, document_type, file_name, expiry_date")
      .eq("employee_id", emp.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    admin
      .from("hr_letter_requests")
      .select(
        "id, letter_type, addressed_to, purpose, status, hr_notes, attachment_url, created_at",
      )
      .eq("employee_id", emp.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    admin
      .from("leave_types")
      .select("id, name, requires_attachment, gender_restriction")
      .is("deleted_at", null)
      .eq("status", "active")
      .order("name"),
  ]);

  const fullName = `${emp.first_name} ${emp.last_name}`;
  const payslips = (slipRows ?? [])
    .map((p) => {
      const run = p.run as {
        period_year: number;
        period_month: number;
        status: string;
      } | null;
      return {
        id: p.id,
        runId: p.run_id,
        periodLabel: run
          ? `${MONTHS[run.period_month - 1]} ${run.period_year}`
          : "—",
        employeeName: fullName,
        basic: num(p.basic),
        housing: num(p.housing_allowance),
        transport: num(p.transport_allowance),
        other: num(p.other_allowances),
        overtime: num(p.overtime),
        bonus: num(p.bonus),
        commission: num(p.commission),
        gross: num(p.gross),
        deductions: num(p.deductions),
        loanDeduction: num(p.loan_deduction),
        tax: num(p.tax),
        net: num(p.net),
        currency: p.currency,
        status: run?.status ?? "draft",
      };
    })
    .filter((p) => p.status === "approved" || p.status === "paid");

  return {
    profile: toProfile(emp),
    leaveBalances,
    leaveRequests: (leaveRows ?? []).map((l) => ({
      id: l.id,
      leaveType: (l.leave_type as { name: string } | null)?.name ?? "—",
      startDate: l.start_date,
      endDate: l.end_date,
      totalDays: num(l.total_days),
      status: l.status,
    })),
    attendance: (attRows ?? []).map((a) => ({
      date: a.attendance_date,
      status: a.status,
      workMinutes: num(a.work_minutes),
      lateMinutes: num(a.late_minutes),
    })),
    payslips,
    documents: (docRows ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      documentType: d.document_type,
      fileName: d.file_name,
      expiryDate: d.expiry_date,
    })),
    letters: (letterRows ?? []).map((l) => ({
      id: l.id,
      letterType: l.letter_type,
      addressedTo: l.addressed_to,
      purpose: l.purpose,
      status: l.status as SelfServiceData["letters"][number]["status"],
      hrNotes: l.hr_notes,
      hasAttachment: !!l.attachment_url,
      createdAt: l.created_at,
    })),
    leaveTypes: (typeRows ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      requiresAttachment: t.requires_attachment,
      genderRestriction: t.gender_restriction,
    })),
    ...feed,
  };
}
