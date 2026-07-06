import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { AdvancesWorkspace } from "@/features/payroll/components/advances-workspace";
import { getAdvances, computeAdvanceSummary } from "@/features/payroll/queries/advances.queries";
import { getPayrollFormOptions } from "@/features/payroll/queries/payroll.queries";

export const metadata: Metadata = { title: "Salary Advances" };

export default async function AdvancesPage() {
  const user = await requirePermission(PERMISSIONS.ADVANCE_VIEW);
  const [advances, options] = await Promise.all([getAdvances(), getPayrollFormOptions()]);
  const summary = computeAdvanceSummary(advances);
  const canManage = hasPermission(user.permissions, PERMISSIONS.ADVANCE_MANAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Advances"
        description="Review and approve short-term salary advance requests. Deductions apply automatically in payroll."
      />
      <AdvancesWorkspace
        advances={advances}
        summary={summary}
        options={options}
        canManage={canManage}
      />
    </div>
  );
}
