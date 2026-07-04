import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { WpsWorkspace } from "@/features/wps/components/wps-workspace";
import { getPayrollRunsForWPS } from "@/features/wps/queries/wps.queries";

export const metadata: Metadata = { title: "WPS & Gratuity" };

export default async function WpsPage() {
  await requirePermission(PERMISSIONS.WPS_VIEW);
  const payrollRuns = await getPayrollRunsForWPS();

  return (
    <div className="space-y-6">
      <PageHeader
        title="WPS & Gratuity"
        description="Generate UAE Wage Protection System SIF files and calculate end-of-service gratuity."
      />
      <WpsWorkspace payrollRuns={payrollRuns} />
    </div>
  );
}
