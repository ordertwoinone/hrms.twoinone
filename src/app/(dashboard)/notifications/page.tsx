import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requireAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationCenter } from "@/features/notifications/components/notification-center";
import { getNotificationCenterData } from "@/features/notifications/queries/notifications.queries";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const user = await requireAuth();
  const data = await getNotificationCenterData(user.id);
  const canManage = hasPermission(
    user.permissions,
    PERMISSIONS.NOTIFICATION_MANAGE,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Alerts, approvals, and reminders — and how you receive them."
      />
      <NotificationCenter data={data} canManage={canManage} />
    </div>
  );
}
