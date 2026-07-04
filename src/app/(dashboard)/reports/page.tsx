import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ReportsWorkspace } from "@/features/reports/components/reports-workspace";
import {
  getAnalyticsOverview,
  getReport,
} from "@/features/reports/queries/reports.queries";

export const metadata: Metadata = {
  title: "Reports & Analytics",
};

export default async function ReportsPage() {
  await requirePermission(PERMISSIONS.REPORT_VIEW);

  const [overview, initialDataset] = await Promise.all([
    getAnalyticsOverview(),
    getReport("employees"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Organization-wide insights and exportable reports across every module."
      />
      <ReportsWorkspace overview={overview} initialDataset={initialDataset} />
    </div>
  );
}
