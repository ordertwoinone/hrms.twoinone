import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import {
  getRoleOptions,
  getUsers,
} from "@/features/users/queries/users.queries";
import { UsersTable } from "@/features/users/components/users-table";

export const metadata: Metadata = {
  title: "Users",
};

/**
 * User Management — Super Admin only (gated by `user:manage`, which RLS also
 * enforces at the database). Lists all users with search, filters, pagination,
 * and management actions.
 */
export default async function UsersPage() {
  const currentUser = await requirePermission(PERMISSIONS.USER_MANAGE);
  const [users, roles] = await Promise.all([getUsers(), getRoleOptions()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage who can access the system and what they can do."
      />
      <UsersTable users={users} roles={roles} currentUserId={currentUser.id} />
    </div>
  );
}
