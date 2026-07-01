import "server-only";

import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLES } from "@/config/roles";
import { logger } from "@/lib/logger";

/**
 * Secure first-run bootstrap.
 *
 * If the system has **no users**, and `SUPER_ADMIN_*` env vars are set, this
 * creates the first Super Admin via the auth admin API (server-only, service
 * role). The `handle_new_user` trigger then creates the matching profile with
 * the super_admin role.
 *
 * Bootstrap disables itself automatically: once any profile exists, the count
 * check short-circuits. There is no public registration anywhere in the app.
 */
let bootstrapDisabled = false;

export async function ensureSuperAdminBootstrap(): Promise<void> {
  if (bootstrapDisabled) return;

  const email = env.SUPER_ADMIN_EMAIL;
  const password = env.SUPER_ADMIN_PASSWORD;
  const fullName = env.SUPER_ADMIN_NAME;

  // No credentials configured → nothing to do.
  if (!email || !password || !fullName) {
    bootstrapDisabled = true;
    return;
  }

  const admin = createAdminClient();

  const { count, error: countError } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (countError) {
    // Transient; don't disable — retry on the next request.
    logger.error("Bootstrap: profile count check failed", {
      error: countError.message,
    });
    return;
  }

  if ((count ?? 0) > 0) {
    bootstrapDisabled = true; // a user exists → bootstrap is permanently off
    return;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role_key: ROLES.SUPER_ADMIN },
  });

  if (error) {
    logger.error("Bootstrap: failed to create first Super Admin", {
      error: error.message,
    });
    return;
  }

  logger.info("Bootstrap: created first Super Admin", {
    userId: data.user?.id,
    email,
  });
  bootstrapDisabled = true;
}
