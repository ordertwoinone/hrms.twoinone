import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side sign-out. POST here to clear the Supabase session cookies and
 * redirect to login. Exposed as a route (vs. only the client `signOut`) so the
 * session can be terminated from a plain HTML form without JavaScript.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(ROUTES.login, request.url), {
    status: 303,
  });
}
