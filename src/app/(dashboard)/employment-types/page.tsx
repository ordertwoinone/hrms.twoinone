import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { getEmploymentTypes } from "@/features/employment-types/queries/employment-types.queries";
import { EmploymentTypesTable } from "@/features/employment-types/components/employment-types-table";

export const metadata: Metadata = {
  title: "Employment Types",
};

/**
 * Employment Types. The 5 defaults (Permanent, Contract, Temporary, Internship,
 * Probation) ship as protected system types; admins can add custom ones. Visible
 * to `employment_type:view`; managed with `employment_type:manage` (+ RLS).
 */
export default async function EmploymentTypesPage() {
  const user = await requirePermission(PERMISSIONS.EMPLOYMENT_TYPE_VIEW);
  const employmentTypes = await getEmploymentTypes();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employment Types"
        description="Define the employment types used across employee records."
      />
      <EmploymentTypesTable
        employmentTypes={employmentTypes}
        canManage={hasPermission(
          user.permissions,
          PERMISSIONS.EMPLOYMENT_TYPE_MANAGE,
        )}
      />
    </div>
  );
}
