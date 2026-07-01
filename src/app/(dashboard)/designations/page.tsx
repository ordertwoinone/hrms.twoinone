import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import {
  getDesignationDepartmentOptions,
  getDesignations,
} from "@/features/designations/queries/designations.queries";
import { DesignationsTable } from "@/features/designations/components/designations-table";

export const metadata: Metadata = {
  title: "Designations",
};

/**
 * Designation Management. Visible to `designation:view` holders; create/update/
 * delete are gated by `designation:manage` (and by RLS at the database).
 */
export default async function DesignationsPage() {
  const user = await requirePermission(PERMISSIONS.DESIGNATION_VIEW);
  const [designations, departments] = await Promise.all([
    getDesignations(),
    getDesignationDepartmentOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Designations"
        description="Manage job titles and grades across your organization."
      />
      <DesignationsTable
        designations={designations}
        departments={departments}
        canManage={hasPermission(
          user.permissions,
          PERMISSIONS.DESIGNATION_MANAGE,
        )}
      />
    </div>
  );
}
