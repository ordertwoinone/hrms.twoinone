import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { ROLE_ORDER, ROLE_LABELS, ROLE_PERMISSIONS } from "@/config/roles";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Roles & Permissions — Settings",
};

const PERMISSION_GROUPS: { label: string; permissions: { key: string; label: string }[] }[] = [
  {
    label: "Users & Roles",
    permissions: [
      { key: PERMISSIONS.USER_VIEW, label: "View users" },
      { key: PERMISSIONS.USER_MANAGE, label: "Manage users" },
      { key: PERMISSIONS.ROLE_VIEW, label: "View roles" },
      { key: PERMISSIONS.ROLE_MANAGE, label: "Manage roles" },
      { key: PERMISSIONS.AUDIT_VIEW, label: "View audit log" },
      { key: PERMISSIONS.SETTINGS_VIEW, label: "View settings" },
      { key: PERMISSIONS.SETTINGS_MANAGE, label: "Manage settings" },
    ],
  },
  {
    label: "Company",
    permissions: [
      { key: PERMISSIONS.COMPANY_VIEW, label: "View company" },
      { key: PERMISSIONS.COMPANY_MANAGE, label: "Manage company" },
      { key: PERMISSIONS.BRANCH_VIEW, label: "View branches" },
      { key: PERMISSIONS.BRANCH_CREATE, label: "Create branches" },
      { key: PERMISSIONS.BRANCH_UPDATE, label: "Update branches" },
      { key: PERMISSIONS.BRANCH_DELETE, label: "Delete branches" },
      { key: PERMISSIONS.DEPARTMENT_VIEW, label: "View departments" },
      { key: PERMISSIONS.DEPARTMENT_MANAGE, label: "Manage departments" },
      { key: PERMISSIONS.DESIGNATION_VIEW, label: "View designations" },
      { key: PERMISSIONS.DESIGNATION_MANAGE, label: "Manage designations" },
      { key: PERMISSIONS.EMPLOYMENT_TYPE_VIEW, label: "View employment types" },
      { key: PERMISSIONS.EMPLOYMENT_TYPE_MANAGE, label: "Manage employment types" },
    ],
  },
  {
    label: "Employees",
    permissions: [
      { key: PERMISSIONS.EMPLOYEE_VIEW, label: "View employees" },
      { key: PERMISSIONS.EMPLOYEE_CREATE, label: "Create employees" },
      { key: PERMISSIONS.EMPLOYEE_UPDATE, label: "Update employees" },
      { key: PERMISSIONS.EMPLOYEE_DELETE, label: "Delete employees" },
    ],
  },
  {
    label: "Attendance & Leave",
    permissions: [
      { key: PERMISSIONS.ATTENDANCE_VIEW, label: "View attendance" },
      { key: PERMISSIONS.ATTENDANCE_MANAGE, label: "Manage attendance" },
      { key: PERMISSIONS.LEAVE_VIEW, label: "View leave" },
      { key: PERMISSIONS.LEAVE_REQUEST, label: "Request leave" },
      { key: PERMISSIONS.LEAVE_APPROVE, label: "Approve leave" },
      { key: PERMISSIONS.LEAVE_MANAGE, label: "Manage leave" },
    ],
  },
  {
    label: "Compliance",
    permissions: [
      { key: PERMISSIONS.VISA_VIEW, label: "View visas" },
      { key: PERMISSIONS.VISA_MANAGE, label: "Manage visas" },
      { key: PERMISSIONS.EMIRATES_ID_VIEW, label: "View Emirates IDs" },
      { key: PERMISSIONS.EMIRATES_ID_MANAGE, label: "Manage Emirates IDs" },
      { key: PERMISSIONS.PASSPORT_VIEW, label: "View passports" },
      { key: PERMISSIONS.PASSPORT_MANAGE, label: "Manage passports" },
      { key: PERMISSIONS.LABOUR_CARD_VIEW, label: "View labour cards" },
      { key: PERMISSIONS.LABOUR_CARD_MANAGE, label: "Manage labour cards" },
      { key: PERMISSIONS.MEDICAL_INSURANCE_VIEW, label: "View medical insurance" },
      { key: PERMISSIONS.MEDICAL_INSURANCE_MANAGE, label: "Manage medical insurance" },
      { key: PERMISSIONS.CONTRACT_VIEW, label: "View contracts" },
      { key: PERMISSIONS.CONTRACT_MANAGE, label: "Manage contracts" },
      { key: PERMISSIONS.CONTRACT_APPROVE, label: "Approve contracts" },
    ],
  },
  {
    label: "Finance & Reports",
    permissions: [
      { key: PERMISSIONS.PAYROLL_VIEW, label: "View payroll" },
      { key: PERMISSIONS.PAYROLL_PROCESS, label: "Process payroll" },
      { key: PERMISSIONS.PAYROLL_APPROVE, label: "Approve payroll" },
      { key: PERMISSIONS.DOCUMENT_VIEW, label: "View documents" },
      { key: PERMISSIONS.DOCUMENT_MANAGE, label: "Manage documents" },
      { key: PERMISSIONS.REPORT_VIEW, label: "View reports" },
      { key: PERMISSIONS.NOTIFICATION_MANAGE, label: "Manage notifications" },
    ],
  },
];

export default async function RolesSettingsPage() {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/settings">
            <ArrowLeft className="mr-1.5 size-4" />
            Settings
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Roles & Permissions"
        description="Read-only permission matrix showing what each system role can access."
      />

      <div className="space-y-8">
        {PERMISSION_GROUPS.map((group) => (
          <section key={group.label} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </h2>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Permission</TableHead>
                    {ROLE_ORDER.map((role) => (
                      <TableHead key={role} className="text-center w-[110px]">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {ROLE_LABELS[role]}
                        </Badge>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.permissions.map((perm) => (
                    <TableRow key={perm.key}>
                      <TableCell className="text-sm text-muted-foreground">
                        {perm.label}
                      </TableCell>
                      {ROLE_ORDER.map((role) => {
                        const granted = (ROLE_PERMISSIONS[role] as readonly string[]).includes(perm.key);
                        return (
                          <TableCell key={role} className="text-center">
                            {granted ? (
                              <span className="flex justify-center">
                                <Check className="size-4 text-success" />
                              </span>
                            ) : (
                              <span className="text-muted-foreground/30 text-lg leading-none">
                                ·
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
