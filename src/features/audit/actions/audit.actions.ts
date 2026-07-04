"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { assertPermission } from "@/lib/auth/guards";
import { AuthorizationError } from "@/lib/auth/guards";
import type { ActionResult } from "@/types/common";
import { formatDateTime } from "@/utils";
import { entityLabel, actionMeta } from "../constants";
import { getAuditLogs, AUDIT_PAGE_SIZE } from "../queries/audit.queries";
import type { AuditLogItem } from "../types";

/** Returns a CSV string of audit logs matching the given filters (max 5 000 rows). */
export async function exportAuditCsv(filters: {
  action?: string;
  entity?: string;
  actorId?: string;
  from?: string;
  to?: string;
  search?: string;
}): Promise<ActionResult<string>> {
  try {
    await assertPermission(PERMISSIONS.AUDIT_VIEW);
    const { rows } = await getAuditLogs({ ...filters, limit: 5000 }, 1);

    const header = [
      "Timestamp",
      "Actor",
      "Action",
      "Entity",
      "Entity ID",
      "IP Address",
      "Browser",
      "Device",
    ].join(",");

    const csvRows = rows.map((r) =>
      [
        formatDateTime(r.createdAt),
        r.actorName,
        actionMeta(r.action).label,
        entityLabel(r.entity),
        r.entityId ?? "",
        r.ip ?? "",
        r.browser ?? "",
        r.device ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );

    return { success: true, data: [header, ...csvRows].join("\n") };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Export failed. Please try again." };
  }
}

/** Fetch a page of audit logs for client-side use. */
export async function fetchAuditPage(input: {
  action?: string;
  entity?: string;
  actorId?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
}): Promise<ActionResult<{ rows: AuditLogItem[]; total: number }>> {
  try {
    await assertPermission(PERMISSIONS.AUDIT_VIEW);
    const { page = 1, ...filters } = input;
    const result = await getAuditLogs({ ...filters, limit: AUDIT_PAGE_SIZE }, page);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch audit logs." };
  }
}
