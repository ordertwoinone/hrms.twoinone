/**
 * Permission catalog (RBAC).
 *
 * Permissions are expressed as `resource:action` strings. Modules check
 * permissions, not roles, so access can be re-mapped without touching feature
 * code. Roles are simply named bundles of these permissions (see
 * `src/config/roles.ts`).
 */
export const PERMISSIONS = {
  // Employees
  EMPLOYEE_VIEW: "employee:view",
  EMPLOYEE_CREATE: "employee:create",
  EMPLOYEE_UPDATE: "employee:update",
  EMPLOYEE_DELETE: "employee:delete",

  // Departments
  DEPARTMENT_VIEW: "department:view",
  DEPARTMENT_MANAGE: "department:manage",

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

  // Settings / administration
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
  AUDIT_LOG_VIEW: "audit:view",
  USER_MANAGE: "user:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** All permissions as an array (used to grant the super-admin role). */
export const ALL_PERMISSIONS: readonly Permission[] =
  Object.values(PERMISSIONS);
