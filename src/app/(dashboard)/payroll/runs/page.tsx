import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { RunsTable } from "@/features/payroll/components/runs-table";
import { getPayrollRuns } from "@/features/payroll/queries/payroll.queries";

export const metadata: Metadata = { title: "Payroll Runs" };

export default async function PayrollRunsPage() {
  const user = await requirePermission(PERMISSIONS.PAYROLL_VIEW);
  const runs = await getPayrollRuns();
  const canProcess = hasPermission(user.permissions, PERMISSIONS.PAYROLL_PROCESS);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Runs"
        description="Create, review, approve, and process monthly payroll runs."
      />
      <RunsTable runs={runs} canProcess={canProcess} />
    </div>
  );
}
