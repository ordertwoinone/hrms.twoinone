import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { SalaryStructuresTable } from "@/features/payroll/components/salary-structures-table";
import { getSalaryStructures } from "@/features/payroll/queries/payroll.queries";

export const metadata: Metadata = { title: "Salary Structures" };

export default async function SalaryStructuresPage() {
  const user = await requirePermission(PERMISSIONS.SALARY_VIEW);
  const structures = await getSalaryStructures();
  const canManage = hasPermission(user.permissions, PERMISSIONS.SALARY_MANAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Structures"
        description="Manage employee salary components: basic, allowances, deductions, and overtime rates."
      />
      <SalaryStructuresTable structures={structures} canManage={canManage} />
    </div>
  );
}
