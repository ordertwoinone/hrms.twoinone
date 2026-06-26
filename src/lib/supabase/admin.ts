import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { env } from "@/lib/env";

/**
 * Admin Supabase client (service-role, BYPASSES Row Level Security).
 *
 * `import "server-only"` guarantees this can never be bundled into client code.
 * Use sparingly and only for trusted operations that legitimately need to skip
 * RLS: provisioning users, system jobs, webhooks, seed scripts. Never expose
 * the resulting data to a user without an explicit authorization check.
 */
export function createAdminClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
