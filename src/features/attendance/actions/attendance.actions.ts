"use server";

import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/server/audit";
import type { ActionResult } from "@/types/common";

const EntrySchema = z.object({
  employeeId: z.string().uuid(),
  attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkIn: z.string().nullable().optional(),
  checkOut: z.string().nullable().optional(),
  status: z.enum(["present", "absent", "late", "half_day", "on_leave", "holiday", "weekend"]),
  shiftId: z.string().uuid().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export async function upsertAttendance(
  input: z.infer<typeof EntrySchema>,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  const parsed = EntrySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const admin = createAdminClient();

  const { data: emp } = await admin
    .from("employees")
    .select("company_id")
    .eq("id", parsed.data.employeeId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!emp) return { success: false, error: "Employee not found" };

  const { data: existing } = await admin
    .from("attendance")
    .select("id")
    .eq("employee_id", parsed.data.employeeId)
    .eq("attendance_date", parsed.data.attendanceDate)
    .is("deleted_at", null)
    .maybeSingle();

  const payload = {
    employee_id: parsed.data.employeeId,
    company_id: emp.company_id,
    attendance_date: parsed.data.attendanceDate,
    check_in: parsed.data.checkIn ?? null,
    check_out: parsed.data.checkOut ?? null,
    status: parsed.data.status,
    shift_id: parsed.data.shiftId ?? null,
    notes: parsed.data.notes ?? null,
    updated_by: user.id,
  };

  if (existing) {
    const { error } = await admin
      .from("attendance")
      .update(payload)
      .eq("id", existing.id);
    if (error) return { success: false, error: error.message };
    await recordAudit({ actorId: user.id, action: "update", entity: "attendance", entityId: existing.id });
    return { success: true, data: { id: existing.id } };
  } else {
    const { data, error } = await admin
      .from("attendance")
      .insert({ ...payload, created_by: user.id })
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
    await recordAudit({ actorId: user.id, action: "create", entity: "attendance", entityId: data.id });
    return { success: true, data: { id: data.id } };
  }
}

export async function upsertShift(input: {
  id?: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  graceMinutes: number;
  status: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  const admin = createAdminClient();
  const { data: emp } = await admin
    .from("employees")
    .select("company_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  const companyId = emp?.company_id;
  if (!companyId) {
    const { data: co } = await admin.from("companies").select("id").is("deleted_at", null).limit(1).maybeSingle();
    if (!co) return { success: false, error: "No company found" };
  }
  const finalCompanyId = companyId ?? (await admin.from("companies").select("id").is("deleted_at", null).limit(1).maybeSingle()).data?.id;
  if (!finalCompanyId) return { success: false, error: "No company" };

  const payload = {
    company_id: finalCompanyId,
    name: input.name,
    code: input.code,
    start_time: input.startTime,
    end_time: input.endTime,
    break_minutes: input.breakMinutes,
    grace_minutes: input.graceMinutes,
    status: input.status,
    updated_by: user.id,
  };

  if (input.id) {
    const { error } = await admin.from("shifts").update(payload).eq("id", input.id);
    if (error) return { success: false, error: error.message };
    await recordAudit({ actorId: user.id, action: "update", entity: "shift", entityId: input.id });
    return { success: true, data: { id: input.id } };
  } else {
    const { data, error } = await admin
      .from("shifts")
      .insert({ ...payload, created_by: user.id })
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
    await recordAudit({ actorId: user.id, action: "create", entity: "shift", entityId: data.id });
    return { success: true, data: { id: data.id } };
  }
}
