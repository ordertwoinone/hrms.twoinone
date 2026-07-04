import "server-only";

import { headers } from "next/headers";

import type { Json } from "@/types/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

/**
 * Best-effort capture of the request's client context (IP + user agent) for the
 * audit trail. Returns `{}` when called outside a request scope (e.g. a job).
 */
async function getClientContext(): Promise<Record<string, string>> {
  try {
    const h = await headers();
    const ctx: Record<string, string> = {};
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      undefined;
    const ua = h.get("user-agent") || undefined;
    if (ip) ctx.ip = ip;
    if (ua) ctx.userAgent = ua;
    return ctx;
  } catch {
    return {};
  }
}

/**
 * Audit logging.
 *
 * Every state-changing action should record an immutable audit entry. The
 * write uses the admin client so the append cannot be blocked by RLS, but the
 * `audit_logs` table itself is read-restricted to users holding
 * `audit:view`. Schema is created in a later migration; this helper is the
 * single call site features use.
 */
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "restore"
  | "login"
  | "logout"
  | "export"
  | "approve"
  | "reject";

export interface AuditEntry {
  actorId: string; // user who performed the action
  action: AuditAction;
  entity: string; // table / resource name, e.g. "employees"
  entityId: string | null; // affected row id
  before?: Json; // snapshot before the change (for updates/deletes)
  after?: Json; // snapshot after the change (for creates/updates)
  metadata?: Json; // ip, user agent, request id, etc.
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = createAdminClient();
    // Merge auto-captured client context (IP/user agent) with any explicit
    // metadata; explicit values win.
    const ctx = await getClientContext();
    const explicit =
      entry.metadata && typeof entry.metadata === "object"
        ? (entry.metadata as Record<string, unknown>)
        : {};
    const metadata: Json = { ...ctx, ...explicit } as Json;

    await supabase.from("audit_logs").insert({
      actor_id: entry.actorId,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId,
      before: entry.before ?? null,
      after: entry.after ?? null,
      metadata,
    });
  } catch (error) {
    // Auditing must never break the primary operation; log and move on.
    logger.error("Failed to write audit log", {
      entity: entry.entity,
      action: entry.action,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
