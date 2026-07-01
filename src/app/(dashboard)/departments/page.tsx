import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import {
  getDepartmentFormOptions,
  getDepartments,
} from "@/features/departments/queries/departments.queries";
import { DepartmentsTable } from "@/features/departments/components/departments-table";

export const metadata: Metadata = {
  title: "Departments",
};

/**
 * Department Management. Visible to `department:view` holders; create/update/
 * delete are gated by `department:manage` (and by RLS at the database).
 */
export default async function DepartmentsPage() {
  const user = await requirePermission(PERMISSIONS.DEPARTMENT_VIEW);
  const [departments, options] = await Promise.all([
    getDepartments(),
    getDepartmentFormOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Organize your company into departments and sub-departments."
      />
      <DepartmentsTable
        departments={departments}
        options={options}
        canManage={hasPermission(
          user.permissions,
          PERMISSIONS.DEPARTMENT_MANAGE,
        )}
      />
    </div>
  );
}
