import type { Role } from "@/config/roles";
import type { Database } from "@/types/database.types";

export type UserStatus = "active" | "inactive";

/** A row in the users list. */
export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  status: UserStatus;
  roleKey: Role;
  roleName: string;
  lastSignInAt: string | null;
  createdAt: string;
}

/** Full user detail for the profile page. */
export interface UserDetail extends UserListItem {
  updatedAt: string;
}

/** An audit log row (typed from the generated schema). */
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
