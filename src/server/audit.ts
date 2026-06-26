import "server-only";

import type { Json } from "@/types/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

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
    // NOTE: `audit_logs` is created in a migration. Until then this is a no-op
    // safety net so domain code can already call `recordAudit`.
    await supabase.from("audit_logs" as never).insert({
      actor_id: entry.actorId,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId,
      before: entry.before ?? null,
      after: entry.after ?? null,
      metadata: entry.metadata ?? null,
    } as never);
  } catch (error) {
    // Auditing must never break the primary operation; log and move on.
    logger.error("Failed to write audit log", {
      entity: entry.entity,
      action: entry.action,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
