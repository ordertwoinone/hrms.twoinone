/**
 * Permission catalog (RBAC).
 *
 * Permissions are expressed as `resource:action` strings. Modules check
 * permissions, not roles, so access can be re-mapped without touching feature
 * code. This catalog is the TypeScript mirror of the `permissions` table seeded
 * in the database (`supabase/migrations`), so keys MUST stay in sync.
 */
export const PERMISSIONS = {
  // Users (Super Admin only)
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_MANAGE: "user:manage",

  // Roles & permissions
  ROLE_VIEW: "role:view",
  ROLE_MANAGE: "role:manage",

  // Company profile
  COMPANY_VIEW: "company:view",
  COMPANY_MANAGE: "company:manage",

  // Audit & settings
  AUDIT_VIEW: "audit:view",
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",

  // Employees
  EMPLOYEE_VIEW: "employee:view",
  EMPLOYEE_CREATE: "employee:create",
  EMPLOYEE_UPDATE: "employee:update",
  EMPLOYEE_DELETE: "employee:delete",

  // Branches
  BRANCH_VIEW: "branch:view",
  BRANCH_CREATE: "branch:create",
  BRANCH_UPDATE: "branch:update",
  BRANCH_DELETE: "branch:delete",

  // Departments
  DEPARTMENT_VIEW: "department:view",
  DEPARTMENT_MANAGE: "department:manage",

  // Designations
  DESIGNATION_VIEW: "designation:view",
  DESIGNATION_MANAGE: "designation:manage",

  // Employment types
  EMPLOYMENT_TYPE_VIEW: "employment_type:view",
  EMPLOYMENT_TYPE_MANAGE: "employment_type:manage",

  // Attendance
  ATTENDANCE_VIEW: "attendance:view",
  ATTENDANCE_MANAGE: "attendance:manage",

  // Leave
  LEAVE_VIEW: "leave:view",
  LEAVE_REQUEST: "leave:request",
  LEAVE_APPROVE: "leave:approve",

  // Payroll
  PAYROLL_VIEW: "payroll:view",
  PAYROLL_PROCESS: "payroll:process",

  // Documents
  DOCUMENT_VIEW: "document:view",
  DOCUMENT_MANAGE: "document:manage",

  // Reports
  REPORT_VIEW: "report:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** All permissions as an array (used to grant the super-admin role). */
export const ALL_PERMISSIONS: readonly Permission[] =
  Object.values(PERMISSIONS);
