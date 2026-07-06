/**
 * Centralized route map. Every internal navigation target should reference
 * `ROUTES` instead of hard-coded strings so paths can be refactored in one
 * place and are type-checked at call sites.
 */
export const ROUTES = {
  // Public
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  // Authenticated app
  dashboard: "/dashboard",
  users: "/users",
  company: "/company",
  unauthorized: "/unauthorized",
  employees: "/employees",
  branches: "/branches",
  departments: "/departments",
  designations: "/designations",
  employmentTypes: "/employment-types",
  attendance: "/attendance",
  leave: "/leave",
  visas: "/visas",
  emiratesIds: "/emirates-ids",
  passports: "/passports",
  labourCards: "/labour-cards",
  medicalInsurance: "/medical-insurance",
  contracts: "/contracts",
  payroll: "/payroll",
  payrollRuns: "/payroll/runs",
  payrollSalaryStructures: "/payroll/salary-structures",
  payrollLoans: "/payroll/loans",
  payrollAdvances: "/payroll/advances",
  payrollBonuses: "/payroll/bonuses",
  documents: "/documents",
  reports: "/reports",
  settings: "/settings",
  audit: "/audit",
  profile: "/profile",
  selfService: "/self-service",
  notifications: "/notifications",

  // New modules
  onboarding: "/onboarding",
  performance: "/performance",
  training: "/training",
  overtime: "/overtime",
  wps: "/wps",
  recruitment: "/recruitment",
  shifts: "/attendance/shifts",

  // Auth infrastructure
  authCallback: "/auth/callback",
  signOut: "/auth/sign-out",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Routes accessible without an authenticated session. Everything else is
 * protected by the middleware.
 */
export const PUBLIC_ROUTES: readonly string[] = [
  ROUTES.home,
  ROUTES.login,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.authCallback,
];

/** True when `pathname` is reachable without a session. */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
