import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { VisaWorkspace } from "@/features/visas/components/visa-workspace";
import {
  getVisaDashboard,
  getVisaFormOptions,
  getVisas,
} from "@/features/visas/queries/visas.queries";

export const metadata: Metadata = {
  title: "Visas",
};

export default async function VisasPage() {
  const user = await requirePermission(PERMISSIONS.VISA_VIEW);

  const [visas, dashboard, options] = await Promise.all([
    getVisas(),
    getVisaDashboard(),
    getVisaFormOptions(),
  ]);

  const canManage = hasPermission(user.permissions, PERMISSIONS.VISA_MANAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visas"
        description="Track UAE visas, sponsors, and expiry — with 30/60/90-day renewal alerts."
      />
      <VisaWorkspace
        dashboard={dashboard}
        visas={visas}
        options={options}
        canManage={canManage}
      />
    </div>
  );
}
