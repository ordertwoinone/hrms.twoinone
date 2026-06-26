import type { User as SupabaseUser } from "@supabase/supabase-js";

import type { Role } from "@/config/roles";
import type { Permission } from "@/constants/permissions";

/**
 * The application's notion of the signed-in user. Combines the Supabase auth
 * user with the HR profile, role, and the resolved permission set used for
 * client- and server-side authorization checks.
 */
export interface AuthUser {
  id: string; // matches Supabase auth user id
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: Role;
  permissions: Permission[];
  employeeId: string | null; // link to employees table, if applicable
  departmentId: string | null;
}

/** Raw Supabase auth user, re-exported for convenience. */
export type { SupabaseUser };

/** Auth context surface consumed by client components via `useAuth`. */
export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}
