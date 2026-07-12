import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { AttendanceWorkspace } from "@/features/attendance/components/attendance-workspace";
import {
  getAttendanceLogs,
  computeAttendanceSummary,
  getAttendanceFormOptions,
  getMonthlyAttendanceSummaries,
} from "@/features/attendance/queries/attendance.queries";

export const metadata: Metadata = { title: "Attendance" };

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function AttendancePage({ searchParams }: PageProps) {
  const user = await requirePermission(PERMISSIONS.ATTENDANCE_VIEW);
  const params = await searchParams;

  const currentMonth = params.month ?? new Date().toISOString().slice(0, 7);

  const [rows, options, monthlySummaries] = await Promise.all([
    getAttendanceLogs({ month: currentMonth }),
    getAttendanceFormOptions(),
    getMonthlyAttendanceSummaries(currentMonth),
  ]);
  const summary = computeAttendanceSummary(rows);

  const canManage = hasPermission(user.permissions, PERMISSIONS.ATTENDANCE_MANAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Track daily check-ins, check-outs, late arrivals, and overtime."
      />
      <AttendanceWorkspace
        rows={rows}
        summary={summary}
        options={options}
        monthlySummaries={monthlySummaries}
        currentMonth={currentMonth}
        canManage={canManage}
      />
    </div>
  );
}
