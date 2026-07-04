import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { PassportWorkspace } from "@/features/passports/components/passport-workspace";
import {
  getPassportDashboard,
  getPassportFormOptions,
  getPassports,
} from "@/features/passports/queries/passports.queries";

export const metadata: Metadata = {
  title: "Passports",
};

export default async function PassportsPage() {
  const user = await requirePermission(PERMISSIONS.PASSPORT_VIEW);

  const [records, dashboard, options] = await Promise.all([
    getPassports(),
    getPassportDashboard(),
    getPassportFormOptions(),
  ]);

  const canManage = hasPermission(user.permissions, PERMISSIONS.PASSPORT_MANAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Passports"
        description="Track passports, nationality, and expiry — with 30/60/90-day renewal reminders."
      />
      <PassportWorkspace
        dashboard={dashboard}
        records={records}
        options={options}
        canManage={canManage}
      />
    </div>
  );
}
