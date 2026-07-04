import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { PayrollWorkspace } from "@/features/payroll/components/payroll-workspace";
import {
  getLoans,
  getPayrollDashboard,
  getPayrollFormOptions,
  getPayrollRuns,
  getSalaryStructures,
} from "@/features/payroll/queries/payroll.queries";

export const metadata: Metadata = {
  title: "Payroll",
};

export default async function PayrollPage() {
  const user = await requirePermission(PERMISSIONS.PAYROLL_VIEW);

  const [dashboard, runs, structures, loans, options] = await Promise.all([
    getPayrollDashboard(),
    getPayrollRuns(),
    getSalaryStructures(),
    getLoans(),
    getPayrollFormOptions(),
  ]);

  const canProcess = hasPermission(user.permissions, PERMISSIONS.PAYROLL_PROCESS);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Salary structures, monthly runs, payslips, loans, and approvals."
      />
      <PayrollWorkspace
        dashboard={dashboard}
        runs={runs}
        structures={structures}
        loans={loans}
        options={options}
        canProcess={canProcess}
      />
    </div>
  );
}
