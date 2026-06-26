import { NextResponse } from "next/server";

/**
 * Liveness probe for uptime monitors and load balancers. Intentionally does no
 * DB work so it stays fast and can't be taken down by a slow query.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "hrms",
    timestamp: new Date().toISOString(),
  });
}
