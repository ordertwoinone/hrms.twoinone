import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Edge middleware. Runs on every matched request to (a) refresh the Supabase
 * auth session cookies and (b) enforce the public/protected route boundary.
 *
 * The heavy lifting lives in `updateSession` to keep this entrypoint minimal.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /**
   * Run on all paths EXCEPT static assets and image optimization, where auth
   * has no meaning and the overhead is wasted. Add any other public asset
   * patterns here.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
