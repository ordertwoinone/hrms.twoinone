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
  LEAVE_MANAGE: "leave:manage",

  // Visas (UAE immigration)
  VISA_VIEW: "visa:view",
  VISA_MANAGE: "visa:manage",

  // Emirates ID
  EMIRATES_ID_VIEW: "emirates_id:view",
  EMIRATES_ID_MANAGE: "emirates_id:manage",

  // Passports
  PASSPORT_VIEW: "passport:view",
  PASSPORT_MANAGE: "passport:manage",

  // Labour cards
  LABOUR_CARD_VIEW: "labour_card:view",
  LABOUR_CARD_MANAGE: "labour_card:manage",

  // Medical insurance
  MEDICAL_INSURANCE_VIEW: "medical_insurance:view",
  MEDICAL_INSURANCE_MANAGE: "medical_insurance:manage",

  // Contracts
  CONTRACT_VIEW: "contract:view",
  CONTRACT_MANAGE: "contract:manage",
  CONTRACT_APPROVE: "contract:approve",

  // Payroll
  PAYROLL_VIEW: "payroll:view",
  PAYROLL_PROCESS: "payroll:process",
  PAYROLL_APPROVE: "payroll:approve",

  // Documents
  DOCUMENT_VIEW: "document:view",
  DOCUMENT_MANAGE: "document:manage",

  // Reports
  REPORT_VIEW: "report:view",

  // Notifications (running scans / broadcasting)
  NOTIFICATION_MANAGE: "notification:manage",

  // Onboarding / Offboarding
  ONBOARDING_VIEW: "onboarding:view",
  ONBOARDING_MANAGE: "onboarding:manage",

  // Performance Management
  PERFORMANCE_VIEW: "performance:view",
  PERFORMANCE_MANAGE: "performance:manage",

  // Training & Learning
  TRAINING_VIEW: "training:view",
  TRAINING_MANAGE: "training:manage",

  // Overtime
  OVERTIME_VIEW: "overtime:view",
  OVERTIME_APPROVE: "overtime:approve",
  OVERTIME_MANAGE: "overtime:manage",

  // Recruitment / ATS
  RECRUITMENT_VIEW: "recruitment:view",
  RECRUITMENT_MANAGE: "recruitment:manage",

  // WPS / UAE Compliance
  WPS_VIEW: "wps:view",
  WPS_MANAGE: "wps:manage",

  // Salary structures
  SALARY_VIEW: "salary:view",
  SALARY_MANAGE: "salary:manage",

  // Loans
  LOAN_VIEW: "loan:view",
  LOAN_MANAGE: "loan:manage",

  // Salary advances
  ADVANCE_VIEW: "advance:view",
  ADVANCE_MANAGE: "advance:manage",

  // Bonuses
  BONUS_VIEW: "bonus:view",
  BONUS_MANAGE: "bonus:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** All permissions as an array (used to grant the super-admin role). */
export const ALL_PERMISSIONS: readonly Permission[] =
  Object.values(PERMISSIONS);
