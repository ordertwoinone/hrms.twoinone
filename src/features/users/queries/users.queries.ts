import "server-only";

import { createClient } from "@/lib/supabase/server";
import { ROLE_ORDER, ROLES, isRole, type Role } from "@/config/roles";
import type {
  AuditLogRow,
  UserDetail,
  UserListItem,
  UserStatus,
} from "../types";

const USER_SELECT =
  "id, email, full_name, avatar_url, phone, status, last_sign_in_at, created_at, updated_at, role:roles(key, name)";

function toListItem(row: {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  status: string;
  last_sign_in_at: string | null;
  created_at: string;
  role: { key: string; name: string } | null;
}): UserListItem {
  const roleKey = row.role?.key;
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    status: row.status as UserStatus,
    roleKey: roleKey && isRole(roleKey) ? roleKey : ROLES.EMPLOYEE,
    roleName: row.role?.name ?? "—",
    lastSignInAt: row.last_sign_in_at,
    createdAt: row.created_at,
  };
}

/** All users (active + inactive), newest first. RLS restricts to privileged callers. */
export async function getUsers(): Promise<UserListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(USER_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toListItem);
}

/** A single user's detail, or null if not found. */
export async function getUserById(id: string): Promise<UserDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(USER_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) return null;
  return { ...toListItem(data), updatedAt: data.updated_at };
}

/** Role options for selects, ordered by privilege. */
export async function getRoleOptions(): Promise<{ key: Role; name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("roles")
    .select("key, name")
    .is("deleted_at", null);

  const byKey = new Map(
    (data ?? [])
      .filter((r) => isRole(r.key))
      .map((r) => [r.key as Role, r.name] as const),
  );

  return ROLE_ORDER.filter((key) => byKey.has(key)).map((key) => ({
    key,
    name: byKey.get(key)!,
  }));
}

/** Recent audit-log entries for a user (entity = "users"). */
export async function getUserAuditLogs(userId: string): Promise<AuditLogRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("entity", "users")
    .eq("entity_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}
