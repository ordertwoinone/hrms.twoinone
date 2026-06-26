import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";
import { clientEnv } from "@/lib/env";

/**
 * Browser Supabase client.
 *
 * Use ONLY inside Client Components / client-side hooks. It reads the session
 * from cookies managed by the SSR middleware. The anon key is public; data is
 * protected by Row Level Security, never by hiding the key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
