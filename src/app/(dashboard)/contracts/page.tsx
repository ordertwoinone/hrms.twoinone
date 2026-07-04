import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { ContractWorkspace } from "@/features/contracts/components/contract-workspace";
import {
  getContractDashboard,
  getContractFormOptions,
  getContracts,
} from "@/features/contracts/queries/contracts.queries";

export const metadata: Metadata = {
  title: "Contracts",
};

export default async function ContractsPage() {
  const user = await requirePermission(PERMISSIONS.CONTRACT_VIEW);

  const [contracts, dashboard, options] = await Promise.all([
    getContracts(),
    getContractDashboard(),
    getContractFormOptions(),
  ]);

  const canManage = hasPermission(user.permissions, PERMISSIONS.CONTRACT_MANAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="Manage employment contracts, documents, approvals, and renewals."
      />
      <ContractWorkspace
        dashboard={dashboard}
        contracts={contracts}
        options={options}
        canManage={canManage}
      />
    </div>
  );
}
