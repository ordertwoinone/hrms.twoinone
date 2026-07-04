import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { parseUserAgent, AUDIT_PAGE_SIZE } from "../constants";
import type { AuditFilterOptions, AuditFilters, AuditLogItem } from "../types";

export { AUDIT_PAGE_SIZE } from "../constants";

export async function getAuditLogs(
  filters: AuditFilters & { search?: string },
  page = 1,
): Promise<{ rows: AuditLogItem[]; total: number }> {
  const admin = createAdminClient();
  const limit = filters.limit ?? AUDIT_PAGE_SIZE;
  const offset = (page - 1) * limit;

  let query = admin
    .from("audit_logs")
    .select(
      "id, actor_id, action, entity, entity_id, before, after, metadata, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (filters.action) query = query.eq("action", filters.action);
  if (filters.entity) query = query.eq("entity", filters.entity);
  if (filters.actorId) query = query.eq("actor_id", filters.actorId);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) {
    // Include the full "to" day
    const toEnd = filters.to.length === 10 ? `${filters.to}T23:59:59Z` : filters.to;
    query = query.lte("created_at", toEnd);
  }
  if (filters.search) query = query.ilike("entity_id", `%${filters.search}%`);

  const { data: rows, count } = await query.range(offset, offset + limit - 1);

  // Batch-fetch actor names from profiles
  const actorIds = [
    ...new Set(
      (rows ?? []).map((r) => r.actor_id).filter((id): id is string => id != null),
    ),
  ];
  const profileMap = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id, p.full_name);
    }
  }

  const items: AuditLogItem[] = (rows ?? []).map((r) => {
    const meta =
      r.metadata && typeof r.metadata === "object"
        ? (r.metadata as Record<string, string>)
        : {};
    const { browser, device } = parseUserAgent(meta["userAgent"] ?? null);
    return {
      id: r.id,
      actorId: r.actor_id ?? null,
      actorName: r.actor_id
        ? (profileMap.get(r.actor_id) ?? "Unknown user")
        : "System",
      action: r.action,
      entity: r.entity,
      entityId: r.entity_id ?? null,
      ip: meta["ip"] ?? null,
      browser,
      device,
      userAgent: meta["userAgent"] ?? null,
      before: r.before ?? null,
      after: r.after ?? null,
      createdAt: r.created_at,
    };
  });

  return { rows: items, total: count ?? 0 };
}

export async function getAuditFilterOptions(): Promise<AuditFilterOptions> {
  const admin = createAdminClient();

  // Fetch distinct entities in the last 10 000 rows (avoids full table scan)
  const { data: entityRows } = await admin
    .from("audit_logs")
    .select("entity")
    .order("created_at", { ascending: false })
    .limit(10000);

  const entities = [...new Set((entityRows ?? []).map((r) => r.entity))].sort();

  // Fetch actors who have at least one audit entry
  const { data: actorRows } = await admin
    .from("audit_logs")
    .select("actor_id")
    .not("actor_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(10000);

  const actorIds = [
    ...new Set(
      (actorRows ?? [])
        .map((r) => r.actor_id as string | null)
        .filter((id): id is string => id != null),
    ),
  ];

  const { data: profiles } =
    actorIds.length > 0
      ? await admin
          .from("profiles")
          .select("id, full_name")
          .in("id", actorIds)
      : { data: [] };

  return {
    entities,
    actors: (profiles ?? [])
      .map((p) => ({ id: p.id, name: p.full_name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
