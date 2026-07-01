import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import {
  getBranchManagerOptions,
  getBranches,
} from "@/features/branches/queries/branches.queries";
import { BranchesTable } from "@/features/branches/components/branches-table";

export const metadata: Metadata = {
  title: "Branches",
};

/**
 * Branch Management. Visible to `branch:view` holders; create/update/delete are
 * gated by the respective permissions (and by RLS at the database).
 */
export default async function BranchesPage() {
  const user = await requirePermission(PERMISSIONS.BRANCH_VIEW);
  const [branches, managers] = await Promise.all([
    getBranches(),
    getBranchManagerOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description="Manage your company’s branches and office locations."
      />
      <BranchesTable
        branches={branches}
        managers={managers}
        canCreate={hasPermission(user.permissions, PERMISSIONS.BRANCH_CREATE)}
        canUpdate={hasPermission(user.permissions, PERMISSIONS.BRANCH_UPDATE)}
        canDelete={hasPermission(user.permissions, PERMISSIONS.BRANCH_DELETE)}
      />
    </div>
  );
}
