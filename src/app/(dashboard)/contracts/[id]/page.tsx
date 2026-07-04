import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import { getContractById } from "@/features/contracts/queries/contracts.queries";
import { ContractDetailView } from "@/features/contracts/components/contract-detail";

export const metadata: Metadata = {
  title: "Contract",
};

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission(PERMISSIONS.CONTRACT_VIEW);
  const { id } = await params;

  const detail = await getContractById(id);
  if (!detail) notFound();

  const canManage = hasPermission(user.permissions, PERMISSIONS.CONTRACT_MANAGE);
  const canApprove = hasPermission(
    user.permissions,
    PERMISSIONS.CONTRACT_APPROVE,
  );

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={ROUTES.contracts}>
            <ArrowLeft className="size-4" />
            Back to contracts
          </Link>
        </Button>
      </div>
      <ContractDetailView
        detail={detail}
        canManage={canManage}
        canApprove={canApprove}
      />
    </div>
  );
}
