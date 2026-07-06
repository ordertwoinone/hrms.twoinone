import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { BonusesWorkspace } from "@/features/payroll/components/bonuses-workspace";
import { getBonuses, computeBonusSummary } from "@/features/payroll/queries/bonuses.queries";
import { getPayrollFormOptions } from "@/features/payroll/queries/payroll.queries";

export const metadata: Metadata = { title: "Bonuses" };

export default async function BonusesPage() {
  const user = await requirePermission(PERMISSIONS.BONUS_VIEW);
  const [bonuses, options] = await Promise.all([getBonuses(), getPayrollFormOptions()]);
  const summary = computeBonusSummary(bonuses);
  const canManage = hasPermission(user.permissions, PERMISSIONS.BONUS_MANAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bonuses"
        description="Manage performance, annual, and one-time bonuses. Approved bonuses are included in the matching payroll run."
      />
      <BonusesWorkspace
        bonuses={bonuses}
        summary={summary}
        options={options}
        canManage={canManage}
      />
    </div>
  );
}
