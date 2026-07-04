"use server";

import type { ActionResult } from "@/types/common";
import { PERMISSIONS } from "@/constants/permissions";
import { assertPermission, AuthorizationError } from "@/lib/auth/guards";
import { getReport } from "../queries/reports.queries";
import type { ReportDataset, ReportType } from "../types";

/** Fetch a report dataset on demand (report explorer). */
export async function fetchReportAction(
  type: ReportType,
): Promise<ActionResult<ReportDataset>> {
  try {
    await assertPermission(PERMISSIONS.REPORT_VIEW);
    const data = await getReport(type);
    return { success: true, data };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Couldn’t load the report." };
  }
}
