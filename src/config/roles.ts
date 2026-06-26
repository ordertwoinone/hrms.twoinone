import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  type Permission,
} from "@/constants/permissions";

/**
 * The fixed set of system roles. These are seeded into the database and act as
 * named bundles of permissions. Per-tenant custom roles can extend this model
 * later, but these defaults cover the typical UAE HR org chart.
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  HR_ADMIN: "hr_admin",
  HR_MANAGER: "hr_manager",
  MANAGER: "manager",
  EMPLOYEE: "employee",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Default permission grants per role. The single source of truth for what each
 * role can do; mirrored into the database seed and enforced by RLS policies.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,

  [ROLES.HR_ADMIN]: [
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_UPDATE,
    PERMISSIONS.EMPLOYEE_DELETE,
    PERMISSIONS.DEPARTMENT_VIEW,
    PERMISSIONS.DEPARTMENT_MANAGE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_PROCESS,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_MANAGE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.AUDIT_LOG_VIEW,
    PERMISSIONS.USER_MANAGE,
  ],

  [ROLES.HR_MANAGER]: [
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_UPDATE,
    PERMISSIONS.DEPARTMENT_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_MANAGE,
    PERMISSIONS.REPORT_VIEW,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.DEPARTMENT_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.REPORT_VIEW,
  ],

  [ROLES.EMPLOYEE]: [
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_REQUEST,
    PERMISSIONS.DOCUMENT_VIEW,
  ],
};

/** Human-readable labels for UI (badges, dropdowns, settings). */
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.HR_ADMIN]: "HR Admin",
  [ROLES.HR_MANAGER]: "HR Manager",
  [ROLES.MANAGER]: "Manager",
  [ROLES.EMPLOYEE]: "Employee",
};
