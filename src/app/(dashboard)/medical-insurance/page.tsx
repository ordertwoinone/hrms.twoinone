import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { InsuranceWorkspace } from "@/features/medical-insurance/components/insurance-workspace";
import {
  getInsuranceDashboard,
  getPolicies,
  getPolicyFormOptions,
} from "@/features/medical-insurance/queries/policies.queries";

export const metadata: Metadata = {
  title: "Medical Insurance",
};

export default async function MedicalInsurancePage() {
  const user = await requirePermission(PERMISSIONS.MEDICAL_INSURANCE_VIEW);

  const [records, dashboard, options] = await Promise.all([
    getPolicies(),
    getInsuranceDashboard(),
    getPolicyFormOptions(),
  ]);

  const canManage = hasPermission(
    user.permissions,
    PERMISSIONS.MEDICAL_INSURANCE_MANAGE,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Insurance"
        description="Track health policies, coverage, and dependents — with 30/60/90-day renewal reminders."
      />
      <InsuranceWorkspace
        dashboard={dashboard}
        records={records}
        options={options}
        canManage={canManage}
      />
    </div>
  );
}
