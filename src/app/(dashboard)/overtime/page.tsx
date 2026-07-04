import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { OvertimeWorkspace } from "@/features/overtime/components/overtime-workspace";
import {
  getOvertimeRequests,
  getOvertimeSummary,
} from "@/features/overtime/queries/overtime.queries";

export const metadata: Metadata = { title: "Overtime Management" };

export default async function OvertimePage() {
  const user = await requirePermission(PERMISSIONS.OVERTIME_VIEW);

  const [requests, summary] = await Promise.all([
    getOvertimeRequests(),
    getOvertimeSummary(),
  ]);

  const canApprove = hasPermission(user.permissions, PERMISSIONS.OVERTIME_APPROVE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overtime Management"
        description="Review and approve overtime requests across departments."
      />
      <OvertimeWorkspace
        requests={requests}
        summary={summary}
        canApprove={canApprove}
      />
    </div>
  );
}
