import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { EmiratesIdWorkspace } from "@/features/emirates-ids/components/emirates-id-workspace";
import {
  getEmiratesIdDashboard,
  getEmiratesIdFormOptions,
  getEmiratesIds,
} from "@/features/emirates-ids/queries/emirates-ids.queries";

export const metadata: Metadata = {
  title: "Emirates IDs",
};

export default async function EmiratesIdsPage() {
  const user = await requirePermission(PERMISSIONS.EMIRATES_ID_VIEW);

  const [records, dashboard, options] = await Promise.all([
    getEmiratesIds(),
    getEmiratesIdDashboard(),
    getEmiratesIdFormOptions(),
  ]);

  const canManage = hasPermission(
    user.permissions,
    PERMISSIONS.EMIRATES_ID_MANAGE,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emirates IDs"
        description="Track Emirates ID records and expiry — with 30/60/90-day renewal alerts."
      />
      <EmiratesIdWorkspace
        dashboard={dashboard}
        records={records}
        options={options}
        canManage={canManage}
      />
    </div>
  );
}
