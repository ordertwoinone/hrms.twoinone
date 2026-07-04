import type { BadgeProps } from "@/components/ui/badge";

export const AUDIT_PAGE_SIZE = 50;

export const AUDIT_ACTIONS: {
  value: string;
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
}[] = [
  { value: "login", label: "Login", variant: "primary" },
  { value: "logout", label: "Logout", variant: "outline" },
  { value: "create", label: "Create", variant: "success" },
  { value: "update", label: "Update", variant: "primary" },
  { value: "delete", label: "Delete", variant: "destructive" },
  { value: "restore", label: "Restore", variant: "warning" },
  { value: "approve", label: "Approve", variant: "success" },
  { value: "reject", label: "Reject", variant: "destructive" },
  { value: "export", label: "Export", variant: "outline" },
];

export function actionMeta(action: string) {
  return (
    AUDIT_ACTIONS.find((a) => a.value === action) ?? {
      value: action,
      label: action,
      variant: "outline" as const,
    }
  );
}

const ENTITY_LABELS: Record<string, string> = {
  auth: "Authentication",
  employees: "Employee",
  employee_salaries: "Salary",
  employee_documents: "Document",
  profiles: "User profile",
  roles: "Role",
  role_permissions: "Role permissions",
  user_permissions: "User permissions",
  visas: "Visa",
  passports: "Passport",
  emirates_ids: "Emirates ID",
  labour_cards: "Labour card",
  medical_insurance_policies: "Medical insurance",
  contracts: "Contract",
  leave_requests: "Leave request",
  payroll_runs: "Payroll run",
  companies: "Company",
  branches: "Branch",
  departments: "Department",
  designations: "Designation",
  employment_types: "Employment type",
};

export function entityLabel(entity: string): string {
  if (ENTITY_LABELS[entity]) return ENTITY_LABELS[entity]!;
  return entity
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Lightweight user-agent parser for the audit trail (browser + device/OS). */
export function parseUserAgent(ua: string | null): {
  browser: string | null;
  device: string | null;
} {
  if (!ua) return { browser: null, device: null };

  let browser = "Unknown";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  const form = /mobile|iphone|android(?!.*tablet)/i.test(ua)
    ? "Mobile"
    : /ipad|tablet/i.test(ua)
      ? "Tablet"
      : "Desktop";

  return { browser, device: `${os} · ${form}` };
}
