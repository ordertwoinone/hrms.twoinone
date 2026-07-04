import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import {
  getEmployeeActivity,
  getEmployeeById,
  getEmployeeFormOptions,
} from "@/features/employees/queries/employees.queries";
import { EmployeeProfile } from "@/features/employees/components/employee-profile";

export const metadata: Metadata = {
  title: "Employee profile",
};

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission(PERMISSIONS.EMPLOYEE_VIEW);
  const { id } = await params;

  const canViewSalary = hasPermission(
    user.permissions,
    PERMISSIONS.PAYROLL_VIEW,
  );
  const canManageSalary = hasPermission(
    user.permissions,
    PERMISSIONS.PAYROLL_PROCESS,
  );

  const [profile, options, activity] = await Promise.all([
    getEmployeeById(id, { canViewSalary, canManageSalary }),
    getEmployeeFormOptions(),
    getEmployeeActivity(id),
  ]);

  if (!profile) notFound();

  return (
    <EmployeeProfile
      profile={profile}
      options={options}
      activity={activity}
      canUpdate={hasPermission(user.permissions, PERMISSIONS.EMPLOYEE_UPDATE)}
      canDelete={hasPermission(user.permissions, PERMISSIONS.EMPLOYEE_DELETE)}
    />
  );
}
