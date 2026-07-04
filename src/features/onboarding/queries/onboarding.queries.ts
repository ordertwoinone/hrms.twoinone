import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface ChecklistItem {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  type: "onboarding" | "offboarding";
  status: "in_progress" | "completed" | "cancelled";
  targetDate: string | null;
  completedAt: string | null;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  type: string;
  description: string | null;
  status: string;
  itemCount: number;
}

export async function getChecklists(type?: "onboarding" | "offboarding"): Promise<ChecklistItem[]> {
  const admin = createAdminClient();
  let q = admin
    .from("onboarding_checklists")
    .select(
      "id, employee_id, title, type, status, target_date, completed_at, created_at, employee:employees!onboarding_checklists_employee_id_fkey(first_name, last_name), tasks:onboarding_tasks(id, completed_at)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (type) q = q.eq("type", type);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((c) => {
    const tasks = (c.tasks ?? []) as Array<{ id: string; completed_at: string | null }>;
    return {
      id: c.id,
      employeeId: c.employee_id,
      employeeName: c.employee ? `${c.employee.first_name} ${c.employee.last_name}` : "—",
      title: c.title,
      type: c.type as ChecklistItem["type"],
      status: c.status as ChecklistItem["status"],
      targetDate: c.target_date,
      completedAt: c.completed_at,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => !!t.completed_at).length,
      createdAt: c.created_at,
    };
  });
}

export async function getTemplates(): Promise<TemplateItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("checklist_templates")
    .select("id, name, type, description, status, items:checklist_template_items(id)")
    .is("deleted_at", null)
    .order("name");

  return (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    description: t.description,
    status: t.status,
    itemCount: (t.items ?? []).length,
  }));
}
