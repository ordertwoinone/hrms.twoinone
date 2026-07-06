import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import {
  getOrgName,
  getPayrollRunById,
} from "@/features/payroll/queries/payroll.queries";
import { RunDetailView } from "@/features/payroll/components/run-detail";

export const metadata: Metadata = {
  title: "Payroll run",
};

export default async function PayrollRunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission(PERMISSIONS.PAYROLL_VIEW);
  const { id } = await params;

  const [run, orgName] = await Promise.all([
    getPayrollRunById(id),
    getOrgName(),
  ]);
  if (!run) notFound();

  const canProcess = hasPermission(user.permissions, PERMISSIONS.PAYROLL_PROCESS);
  const canApprove = hasPermission(user.permissions, PERMISSIONS.PAYROLL_APPROVE);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={ROUTES.payrollRuns}>
          <ArrowLeft className="size-4" />
          Back to payroll runs
        </Link>
      </Button>
      <RunDetailView
        run={run}
        orgName={orgName}
        canProcess={canProcess}
        canApprove={canApprove}
      />
    </div>
  );
}
