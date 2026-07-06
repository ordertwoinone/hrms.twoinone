import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { LoansTable } from "@/features/payroll/components/loans-table";
import {
  getLoans,
  getPayrollFormOptions,
} from "@/features/payroll/queries/payroll.queries";

export const metadata: Metadata = { title: "Employee Loans" };

export default async function LoansPage() {
  const user = await requirePermission(PERMISSIONS.LOAN_VIEW);
  const [loans, options] = await Promise.all([getLoans(), getPayrollFormOptions()]);
  const canManage = hasPermission(user.permissions, PERMISSIONS.LOAN_MANAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Loans"
        description="Track employee loans with automatic monthly deductions via payroll."
      />
      <LoansTable loans={loans} options={options} canManage={canManage} />
    </div>
  );
}
