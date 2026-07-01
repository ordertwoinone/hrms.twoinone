import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import {
  getRoleOptions,
  getUserAuditLogs,
  getUserById,
} from "@/features/users/queries/users.queries";
import { UserDetail } from "@/features/users/components/user-detail";

export const metadata: Metadata = {
  title: "User profile",
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await requirePermission(PERMISSIONS.USER_MANAGE);
  const { id } = await params;

  const [user, roles, auditLogs] = await Promise.all([
    getUserById(id),
    getRoleOptions(),
    getUserAuditLogs(id),
  ]);

  if (!user) notFound();

  return (
    <UserDetail
      user={user}
      roles={roles}
      currentUserId={currentUser.id}
      auditLogs={auditLogs}
    />
  );
}
