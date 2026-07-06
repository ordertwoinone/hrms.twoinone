import "server-only";

import { unstable_cache } from "next/cache";
import { format, addDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  DashboardData,
  DashboardExpiryAlert,
  DashboardBirthday,
} from "../types";

function isoDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

async function fetchDashboardData(): Promise<DashboardData> {
  const admin = createAdminClient();
  const now = new Date();
  const today = isoDate(now);
  const plus30 = isoDate(addDays(now, 30));
  const monthStart = isoDate(startOfMonth(now));
  const monthEnd = isoDate(endOfMonth(now));

  // All 18 independent queries run in one parallel batch — no sequential loops.
  const [
    empRows,
    leaveToday,
    newJoiners,
    resigned,
    visaCount,
    passCount,
    insurCount,
    contractCount,
    eidCount,
    lcCount,
    deptRows,
    leaveCurrentRows,
    auditRows,
    payrollRow,
    // Expiry alert detail queries (previously sequential — now parallel)
    visaAlertRows,
    passAlertRows,
    eidAlertRows,
    lcAlertRows,
  ] = await Promise.all([
    // All active employees (need full rows for distributions + birthdays)
    admin
      .from("employees")
      .select(
        "id, first_name, last_name, nationality, gender, date_of_birth, date_of_joining, date_of_leaving, department_id, departments:departments(name)",
      )
      .is("deleted_at", null)
      .in("status", ["active", "probation", "on_leave"]),

    // On leave today
    admin
      .from("leave_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["approved", "manager_approved"])
      .lte("start_date", today)
      .gte("end_date", today),

    // New joiners this month
    admin
      .from("employees")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("date_of_joining", monthStart)
      .lte("date_of_joining", monthEnd),

    // Resigned this month
    admin
      .from("employees")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("date_of_leaving", monthStart)
      .lte("date_of_leaving", monthEnd),

    // Visa expiring count
    admin
      .from("visas")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("expiry_date", today)
      .lte("expiry_date", plus30),

    // Passport expiring count
    admin
      .from("passports")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("expiry_date", today)
      .lte("expiry_date", plus30),

    // Medical insurance expiring count
    admin
      .from("medical_insurance_policies")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("end_date", today)
      .lte("end_date", plus30),

    // Contract expiring count
    admin
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .not("end_date", "is", null)
      .gte("end_date", today)
      .lte("end_date", plus30),

    // Emirates ID expiring count
    admin
      .from("emirates_ids")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("expiry_date", today)
      .lte("expiry_date", plus30),

    // Labour card expiring count
    admin
      .from("labour_cards")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("expiry_date", today)
      .lte("expiry_date", plus30),

    // Department distribution
    admin
      .from("employees")
      .select("department_id, departments:departments(name)")
      .is("deleted_at", null)
      .in("status", ["active", "probation", "on_leave"])
      .not("department_id", "is", null),

    // Current leave list (top 5)
    admin
      .from("leave_requests")
      .select(
        "employee:employees!leave_requests_employee_id_fkey(first_name, last_name), leave_type:leave_types(name), end_date",
      )
      .in("status", ["approved", "manager_approved"])
      .lte("start_date", today)
      .gte("end_date", today)
      .order("end_date", { ascending: true })
      .limit(5),

    // Recent audit activity (top 6)
    admin
      .from("audit_logs")
      .select("action, entity, metadata, actor_id, created_at")
      .order("created_at", { ascending: false })
      .limit(6),

    // Last payroll run
    admin
      .from("payroll_runs")
      .select("period_month, period_year, total_net, paid_at, approved_at")
      .not("approved_at", "is", null)
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Visa expiry alert details (top 3, previously in sequential loop)
    admin
      .from("visas")
      .select("employee:employees!inner(first_name, last_name), expiry_date")
      .is("deleted_at", null)
      .gte("expiry_date", today)
      .lte("expiry_date", plus30)
      .order("expiry_date", { ascending: true })
      .limit(3),

    // Passport expiry alert details
    admin
      .from("passports")
      .select("employee:employees!inner(first_name, last_name), expiry_date")
      .is("deleted_at", null)
      .gte("expiry_date", today)
      .lte("expiry_date", plus30)
      .order("expiry_date", { ascending: true })
      .limit(3),

    // Emirates ID expiry alert details
    admin
      .from("emirates_ids")
      .select("employee:employees!inner(first_name, last_name), expiry_date")
      .is("deleted_at", null)
      .gte("expiry_date", today)
      .lte("expiry_date", plus30)
      .order("expiry_date", { ascending: true })
      .limit(3),

    // Labour card expiry alert details
    admin
      .from("labour_cards")
      .select("employee:employees!inner(first_name, last_name), expiry_date")
      .is("deleted_at", null)
      .gte("expiry_date", today)
      .lte("expiry_date", plus30)
      .order("expiry_date", { ascending: true })
      .limit(3),
  ]);

  const employees = empRows.data ?? [];

  // ── Distribution charts ──────────────────────────────────────────────────
  const deptCount = new Map<string, number>();
  for (const r of deptRows.data ?? []) {
    const name =
      r.departments && typeof r.departments === "object" && !Array.isArray(r.departments)
        ? (r.departments as { name: string }).name
        : "Unknown";
    deptCount.set(name, (deptCount.get(name) ?? 0) + 1);
  }
  const departmentDistribution = [...deptCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));

  const natCount = new Map<string, number>();
  for (const e of employees) {
    const nat = e.nationality ?? "Unknown";
    natCount.set(nat, (natCount.get(nat) ?? 0) + 1);
  }
  const natSorted = [...natCount.entries()].sort((a, b) => b[1] - a[1]);
  const nationalityDistribution =
    natSorted.length > 5
      ? [
          ...natSorted.slice(0, 5).map(([label, value]) => ({ label, value })),
          { label: "Other", value: natSorted.slice(5).reduce((s, [, v]) => s + v, 0) },
        ]
      : natSorted.map(([label, value]) => ({ label, value }));

  const genderCount = new Map<string, number>();
  for (const e of employees) {
    const g = e.gender === "male" ? "Male" : e.gender === "female" ? "Female" : "Other";
    genderCount.set(g, (genderCount.get(g) ?? 0) + 1);
  }
  const genderDistribution = [...genderCount.entries()].map(([label, value]) => ({
    label,
    value,
  }));

  const headcountTrend = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(now, 5 - i);
    const label = format(month, "MMM");
    const start = isoDate(startOfMonth(month));
    const end = isoDate(endOfMonth(month));
    const count = employees.filter(
      (e) =>
        e.date_of_joining != null &&
        e.date_of_joining >= start &&
        e.date_of_joining <= end,
    ).length;
    return { label, value: count };
  });

  // ── Upcoming birthdays ───────────────────────────────────────────────────
  const upcomingBirthdays: DashboardBirthday[] = [];
  for (const e of employees) {
    if (!e.date_of_birth) continue;
    const dob = new Date(e.date_of_birth);
    const thisBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (thisBday < now) thisBday.setFullYear(now.getFullYear() + 1);
    const diff = Math.ceil((thisBday.getTime() - now.getTime()) / 86_400_000);
    if (diff >= 0 && diff <= 14) {
      upcomingBirthdays.push({ name: `${e.first_name} ${e.last_name}`, daysUntil: diff });
    }
  }
  upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

  // ── Expiry alerts — built directly from parallel results ─────────────────
  const expiryAlerts: DashboardExpiryAlert[] = [];

  function addAlerts(
    rows: { employee: unknown; expiry_date?: string | null }[] | null,
    entity: DashboardExpiryAlert["entity"],
    dateKey: string,
  ) {
    for (const row of rows ?? []) {
      const emp = row.employee as { first_name: string; last_name: string } | null;
      const expiryDate = (row as Record<string, unknown>)[dateKey] as string | null;
      if (!emp || !expiryDate) continue;
      const daysUntil = Math.ceil(
        (new Date(expiryDate).getTime() - now.getTime()) / 86_400_000,
      );
      expiryAlerts.push({ name: `${emp.first_name} ${emp.last_name}`, entity, daysUntil });
    }
  }

  addAlerts(visaAlertRows.data as never, "visa", "expiry_date");
  addAlerts(passAlertRows.data as never, "passport", "expiry_date");
  addAlerts(eidAlertRows.data as never, "emirates_id", "expiry_date");
  addAlerts(lcAlertRows.data as never, "labour_card", "expiry_date");
  expiryAlerts.sort((a, b) => a.daysUntil - b.daysUntil);

  // ── Recent audit activity — resolve actor names ──────────────────────────
  const actorIds = [
    ...new Set(
      (auditRows.data ?? []).map((r) => r.actor_id).filter((id): id is string => id != null),
    ),
  ];
  const profileMap = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds);
    for (const p of profiles ?? []) profileMap.set(p.id, p.full_name);
  }
  const recentActivity = (auditRows.data ?? []).map((r) => ({
    actorName: r.actor_id ? (profileMap.get(r.actor_id) ?? "Unknown") : "System",
    action: r.action,
    entity: r.entity,
    createdAt: r.created_at,
  }));

  // ── Current leave list ───────────────────────────────────────────────────
  const currentLeave = (leaveCurrentRows.data ?? []).map((r) => {
    const emp = r.employee as { first_name: string; last_name: string } | null;
    const lt = r.leave_type as { name: string } | null;
    return {
      employeeName: emp ? `${emp.first_name} ${emp.last_name}` : "—",
      leaveTypeName: lt?.name ?? "—",
      endDate: r.end_date,
    };
  });

  return {
    totalEmployees: employees.length,
    onLeaveToday: leaveToday.count ?? 0,
    newJoinersThisMonth: newJoiners.count ?? 0,
    resignedThisMonth: resigned.count ?? 0,

    visaExpiring30d: visaCount.count ?? 0,
    passportExpiring30d: passCount.count ?? 0,
    insuranceExpiring30d: insurCount.count ?? 0,
    contractsExpiring30d: contractCount.count ?? 0,
    emiratesIdExpiring30d: eidCount.count ?? 0,
    labourCardExpiring30d: lcCount.count ?? 0,

    headcountTrend,
    departmentDistribution,
    nationalityDistribution,
    genderDistribution,

    expiryAlerts: expiryAlerts.slice(0, 6),
    currentLeave,
    upcomingBirthdays: upcomingBirthdays.slice(0, 5),
    recentActivity,

    lastPayrollNet: payrollRow.data?.total_net ?? null,
    lastPayrollMonth: payrollRow.data
      ? format(
          new Date(payrollRow.data.period_year, payrollRow.data.period_month - 1),
          "MMMM yyyy",
        )
      : null,
  };
}

// Cache dashboard data for 60 s — it's an overview, slight staleness is fine.
export const getDashboardData = unstable_cache(fetchDashboardData, ["dashboard-data"], {
  revalidate: 60,
  tags: ["dashboard"],
});
