import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AuditLogRow,
  EmployeeFormOptions,
  EmployeeListItem,
  EmployeeProfile,
  EmployeeStatus,
} from "../types";

/**
 * Employee reads use the service-role admin client (the profile joins branch/
 * department/designation/employment-type names and note authors from
 * `profiles`, which RLS restricts). Access is gated by the route's
 * `requirePermission('employee:view')` guard. Salary is additionally gated by
 * the caller's `payroll:view` permission, passed in explicitly.
 */
const LIST_SELECT =
  "id, employee_code, first_name, last_name, photo_url, work_email, phone, status, date_of_joining, department_id, department:departments(name), designation:designations(name), branch:branches(name), employment_type:employment_types(name)";

export async function getEmployees(): Promise<EmployeeListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("employees")
    .select(LIST_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    code: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`,
    photoUrl: row.photo_url,
    workEmail: row.work_email,
    phone: row.phone,
    departmentId: row.department_id,
    departmentName: row.department?.name ?? null,
    designationName: row.designation?.name ?? null,
    branchName: row.branch?.name ?? null,
    employmentTypeName: row.employment_type?.name ?? null,
    status: row.status as EmployeeStatus,
    dateOfJoining: row.date_of_joining,
  }));
}

export async function getEmployeeFormOptions(): Promise<EmployeeFormOptions> {
  const admin = createAdminClient();
  const [departments, designations, branches, employmentTypes, managers] =
    await Promise.all([
      admin
        .from("departments")
        .select("id, name")
        .is("deleted_at", null)
        .eq("status", "active")
        .order("name"),
      admin
        .from("designations")
        .select("id, name")
        .is("deleted_at", null)
        .eq("status", "active")
        .order("name"),
      admin
        .from("branches")
        .select("id, name")
        .is("deleted_at", null)
        .eq("status", "active")
        .order("name"),
      admin
        .from("employment_types")
        .select("id, name")
        .is("deleted_at", null)
        .eq("status", "active")
        .order("name"),
      admin
        .from("employees")
        .select("id, first_name, last_name")
        .is("deleted_at", null)
        .order("first_name"),
    ]);

  return {
    departments: (departments.data ?? []).map((d) => ({
      id: d.id,
      name: d.name,
    })),
    designations: (designations.data ?? []).map((d) => ({
      id: d.id,
      name: d.name,
    })),
    branches: (branches.data ?? []).map((b) => ({ id: b.id, name: b.name })),
    employmentTypes: (employmentTypes.data ?? []).map((e) => ({
      id: e.id,
      name: e.name,
    })),
    managers: (managers.data ?? []).map((m) => ({
      id: m.id,
      name: `${m.first_name} ${m.last_name}`,
    })),
  };
}

export async function getEmployeeById(
  id: string,
  access: { canViewSalary: boolean; canManageSalary: boolean },
): Promise<EmployeeProfile | null> {
  const admin = createAdminClient();

  const { data: emp } = await admin
    .from("employees")
    .select(
      "*, department:departments(name), designation:designations(name), branch:branches(name), employment_type:employment_types(name)",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!emp) return null;

  const { department, designation, branch, employment_type, ...employee } = emp;

  // Manager name (resolved separately to avoid a self-join).
  let managerName: string | null = null;
  if (employee.manager_id) {
    const { data: mgr } = await admin
      .from("employees")
      .select("first_name, last_name")
      .eq("id", employee.manager_id)
      .maybeSingle();
    if (mgr) managerName = `${mgr.first_name} ${mgr.last_name}`;
  }

  const [
    documents,
    emergencyContacts,
    dependents,
    qualifications,
    experiences,
    assets,
    notesRaw,
  ] = await Promise.all([
    admin
      .from("employee_documents")
      .select("*")
      .eq("employee_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    admin
      .from("emergency_contacts")
      .select("*")
      .eq("employee_id", id)
      .is("deleted_at", null)
      .order("is_primary", { ascending: false }),
    admin
      .from("dependents")
      .select("*")
      .eq("employee_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    admin
      .from("qualifications")
      .select("*")
      .eq("employee_id", id)
      .is("deleted_at", null)
      .order("end_year", { ascending: false }),
    admin
      .from("experiences")
      .select("*")
      .eq("employee_id", id)
      .is("deleted_at", null)
      .order("start_date", { ascending: false }),
    admin
      .from("employee_assets")
      .select("*")
      .eq("employee_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    admin
      .from("employee_notes")
      .select("*")
      .eq("employee_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  // Note authors
  const notes = notesRaw.data ?? [];
  const authorIds = [
    ...new Set(notes.map((n) => n.created_by).filter((v): v is string => !!v)),
  ];
  const authors = new Map<string, string>();
  if (authorIds.length) {
    const { data: profs } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", authorIds);
    for (const p of profs ?? []) authors.set(p.id, p.full_name);
  }

  // Salary (payroll-gated)
  let salaries: EmployeeProfile["salaries"] = [];
  if (access.canViewSalary) {
    const { data } = await admin
      .from("employee_salaries")
      .select("*")
      .eq("employee_id", id)
      .is("deleted_at", null)
      .order("effective_date", { ascending: false });
    salaries = data ?? [];
  }

  return {
    employee,
    departmentName: department?.name ?? null,
    designationName: designation?.name ?? null,
    branchName: branch?.name ?? null,
    employmentTypeName: employment_type?.name ?? null,
    managerName,
    documents: documents.data ?? [],
    emergencyContacts: emergencyContacts.data ?? [],
    dependents: dependents.data ?? [],
    qualifications: qualifications.data ?? [],
    experiences: experiences.data ?? [],
    assets: assets.data ?? [],
    notes: notes.map((n) => ({
      ...n,
      authorName: n.created_by ? (authors.get(n.created_by) ?? null) : null,
    })),
    salaries,
    canViewSalary: access.canViewSalary,
    canManageSalary: access.canManageSalary,
  };
}

/** Activity timeline: audit-log entries recorded against this employee. */
export async function getEmployeeActivity(id: string): Promise<AuditLogRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("*")
    .eq("entity", "employees")
    .eq("entity_id", id)
    .order("created_at", { ascending: false })
    .limit(60);
  return data ?? [];
}
