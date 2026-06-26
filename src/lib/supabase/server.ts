import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import type { Database } from "@/types/database.types";
import { env } from "@/lib/env";

/**
 * Server Supabase client (RLS-enforced, acts as the signed-in user).
 *
 * Use in Server Components, Server Actions, and Route Handlers. It reads/writes
 * the auth cookies so the session stays in sync. Writing cookies from a Server
 * Component throws in Next.js — that case is swallowed because the middleware
 * refreshes the session anyway.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore; the session is
            // refreshed by `updateSession` in the middleware.
          }
        },
      },
    },
  );
}
