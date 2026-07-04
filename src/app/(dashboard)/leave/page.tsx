import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { LeaveWorkspace } from "@/features/leave/components/leave-workspace";
import {
  getEmployeeOptions,
  getLeaveCalendar,
  getLeaveDashboard,
  getLeaveFormOptions,
  getLeaveRequests,
  getLeaveTypes,
} from "@/features/leave/queries/leave.queries";

export const metadata: Metadata = {
  title: "Leave",
};

export default async function LeavePage() {
  const user = await requirePermission(PERMISSIONS.LEAVE_VIEW);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [dashboard, requests, formOptions, employees, leaveTypes, calendar] =
    await Promise.all([
      getLeaveDashboard(year),
      getLeaveRequests(),
      getLeaveFormOptions(),
      getEmployeeOptions(),
      getLeaveTypes(),
      getLeaveCalendar(year, month),
    ]);

  const canRequest =
    hasPermission(user.permissions, PERMISSIONS.LEAVE_REQUEST) ||
    hasPermission(user.permissions, PERMISSIONS.LEAVE_MANAGE);
  const canApprove = hasPermission(user.permissions, PERMISSIONS.LEAVE_APPROVE);
  const canManage = hasPermission(user.permissions, PERMISSIONS.LEAVE_MANAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave"
        description="Track requests, balances, holidays, and approvals across the team."
      />
      <LeaveWorkspace
        dashboard={dashboard}
        requests={requests}
        formOptions={formOptions}
        employees={employees}
        leaveTypes={leaveTypes}
        calendar={{
          year,
          month,
          leaves: calendar.leaves,
          holidays: calendar.holidays,
        }}
        permissions={{ canRequest, canApprove, canManage }}
      />
    </div>
  );
}
