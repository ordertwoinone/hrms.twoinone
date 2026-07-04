import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import { getLeaveRequestById } from "@/features/leave/queries/leave.queries";
import { LeaveRequestDetailView } from "@/features/leave/components/leave-request-detail";

export const metadata: Metadata = {
  title: "Leave request",
};

export default async function LeaveRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission(PERMISSIONS.LEAVE_VIEW);
  const { id } = await params;

  const detail = await getLeaveRequestById(id);
  if (!detail) notFound();

  const canApprove = hasPermission(user.permissions, PERMISSIONS.LEAVE_APPROVE);
  const canManage = hasPermission(user.permissions, PERMISSIONS.LEAVE_MANAGE);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={ROUTES.leave}>
            <ArrowLeft className="size-4" />
            Back to leave
          </Link>
        </Button>
      </div>
      <LeaveRequestDetailView
        detail={detail}
        canApprove={canApprove}
        canManage={canManage}
      />
    </div>
  );
}
