"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/server/audit";
import type { ActionResult } from "@/types/common";

export async function approveOvertime(
  id: string,
): Promise<ActionResult<{ updated: true }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("overtime_requests")
    .update({
      status: "approved",
      hr_id: user.id,
      hr_status: "approved",
      hr_reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  await recordAudit({ actorId: user.id, action: "approve", entity: "overtime_request", entityId: id });
  return { success: true, data: { updated: true } };
}

export async function rejectOvertime(
  id: string,
  remarks: string,
): Promise<ActionResult<{ updated: true }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("overtime_requests")
    .update({
      status: "rejected",
      hr_id: user.id,
      hr_status: "rejected",
      hr_remarks: remarks,
      hr_reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  await recordAudit({ actorId: user.id, action: "reject", entity: "overtime_request", entityId: id });
  return { success: true, data: { updated: true } };
}

export async function submitOvertimeRequest(input: {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursRequested: number;
  reason?: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  const admin = createAdminClient();
  const { data: emp } = await admin
    .from("employees")
    .select("company_id")
    .eq("id", input.employeeId)
    .maybeSingle();
  if (!emp) return { success: false, error: "Employee not found" };

  const { data, error } = await admin
    .from("overtime_requests")
    .insert({
      company_id: emp.company_id,
      employee_id: input.employeeId,
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      hours_requested: input.hoursRequested,
      reason: input.reason ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  await recordAudit({ actorId: user.id, action: "create", entity: "overtime_request", entityId: data.id });
  return { success: true, data: { id: data.id } };
}
