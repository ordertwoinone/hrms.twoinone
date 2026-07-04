import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { LabourCardWorkspace } from "@/features/labour-cards/components/labour-card-workspace";
import {
  getLabourCardDashboard,
  getLabourCardFormOptions,
  getLabourCards,
} from "@/features/labour-cards/queries/labour-cards.queries";

export const metadata: Metadata = {
  title: "Labour Cards",
};

export default async function LabourCardsPage() {
  const user = await requirePermission(PERMISSIONS.LABOUR_CARD_VIEW);

  const [records, dashboard, options] = await Promise.all([
    getLabourCards(),
    getLabourCardDashboard(),
    getLabourCardFormOptions(),
  ]);

  const canManage = hasPermission(
    user.permissions,
    PERMISSIONS.LABOUR_CARD_MANAGE,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Labour Cards"
        description="Track MOHRE labour cards and expiry — with 30/60/90-day renewal reminders."
      />
      <LabourCardWorkspace
        dashboard={dashboard}
        records={records}
        options={options}
        canManage={canManage}
      />
    </div>
  );
}
