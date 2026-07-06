import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { PayrollDashboard } from "@/features/payroll/components/payroll-dashboard";
import { getPayrollDashboard } from "@/features/payroll/queries/payroll.queries";

export const metadata: Metadata = { title: "Payroll" };

export default async function PayrollPage() {
  await requirePermission(PERMISSIONS.PAYROLL_VIEW);
  const dashboard = await getPayrollDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Monthly payroll runs, salary structures, loans, advances, and bonuses."
      />
      <PayrollDashboard data={dashboard} />
    </div>
  );
}
