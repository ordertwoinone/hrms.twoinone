import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/server/audit";

/**
 * Server-side sign-out. POST here to clear the Supabase session cookies and
 * redirect to login. Exposed as a route (vs. only the client `signOut`) so the
 * session can be terminated from a plain HTML form without JavaScript.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await recordAudit({
      actorId: user.id,
      action: "logout",
      entity: "auth",
      entityId: user.id,
    });
  }
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(ROUTES.login, request.url), {
    status: 303,
  });
}
