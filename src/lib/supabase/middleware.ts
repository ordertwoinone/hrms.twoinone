import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import type { Database } from "@/types/database.types";
import { env } from "@/lib/env";
import { ROUTES, isPublicRoute } from "@/constants/routes";

/**
 * Refreshes the Supabase auth session on every request and enforces the
 * public/protected route boundary.
 *
 * IMPORTANT (per Supabase SSR docs): always return the `supabaseResponse`
 * object as-is so the refreshed auth cookies propagate to the browser. Do not
 * create a new response without copying its cookies.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do NOT run code between createServerClient and getUser() — it can cause
  // hard-to-debug session desync.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated user hitting a protected route → send to login.
  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user hitting the login/forgot pages → send to the dashboard.
  // (Reset-password and the auth callback are intentionally excluded so the
  // password-recovery session can complete.)
  if (
    user &&
    (pathname === ROUTES.login || pathname === ROUTES.forgotPassword)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.dashboard;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
