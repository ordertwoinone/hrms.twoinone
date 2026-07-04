import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import {
  getEmployeeFormOptions,
  getEmployees,
} from "@/features/employees/queries/employees.queries";
import { EmployeesTable } from "@/features/employees/components/employees-table";

export const metadata: Metadata = {
  title: "Employees",
};

export default async function EmployeesPage() {
  const user = await requirePermission(PERMISSIONS.EMPLOYEE_VIEW);
  const [employees, options] = await Promise.all([
    getEmployees(),
    getEmployeeFormOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your organization’s people and their records."
      />
      <EmployeesTable
        employees={employees}
        options={options}
        canCreate={hasPermission(user.permissions, PERMISSIONS.EMPLOYEE_CREATE)}
        canUpdate={hasPermission(user.permissions, PERMISSIONS.EMPLOYEE_UPDATE)}
        canDelete={hasPermission(user.permissions, PERMISSIONS.EMPLOYEE_DELETE)}
      />
    </div>
  );
}
