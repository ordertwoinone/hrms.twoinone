import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase auth callback.
 *
 * Handles the redirect after email confirmation, magic links, OAuth, and
 * password recovery by exchanging the `code` for a session cookie. On success
 * the user is forwarded to `next` (defaulting to the dashboard); failures land
 * on the login page with an error flag.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? ROUTES.dashboard;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_callback`);
}
