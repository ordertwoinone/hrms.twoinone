import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Attendance",
};

export default async function AttendancePage() {
  await requirePermission(PERMISSIONS.ATTENDANCE_VIEW);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Track daily check-ins, check-outs, late arrivals, and absences."
      />
      <EmptyState
        icon={CalendarClock}
        title="Coming soon"
        description="The Attendance module is under active development and will be available in the next release."
      />
    </div>
  );
}
