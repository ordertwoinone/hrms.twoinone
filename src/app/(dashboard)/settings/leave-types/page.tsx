import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getLeaveTypes } from "@/features/leave";
import { LeaveTypesManager } from "@/features/leave/components/leave-types-manager";

export const metadata: Metadata = {
  title: "Leave Types — Settings",
};

export default async function LeaveTypesSettingsPage() {
  const user = await requirePermission(PERMISSIONS.LEAVE_VIEW);
  const leaveTypes = await getLeaveTypes();
  const canManage = hasPermission(user.permissions, PERMISSIONS.LEAVE_MANAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/settings">
            <ArrowLeft className="mr-1.5 size-4" />
            Settings
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Leave Types"
        description="Define the categories of leave employees can request — annual, sick, maternity, and more."
      />

      <LeaveTypesManager leaveTypes={leaveTypes} canManage={canManage} />
    </div>
  );
}
