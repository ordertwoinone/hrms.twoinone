"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { formatDate, getInitials } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteEmployee, setEmployeeStatus } from "../actions/employee.actions";
import { EMPLOYEE_STATUSES } from "../constants";
import type {
  EmployeeFormOptions,
  EmployeeProfile as Profile,
  AuditLogRow,
  EmployeeStatus,
} from "../types";
import { EmployeeStatusBadge } from "./employee-status-badge";
import { EmployeeFormDialog } from "./employee-form-dialog";
import { EmployeeImageUploader } from "./employee-image-uploader";
import { OverviewSection } from "./sections/overview-section";
import { DocumentsSection } from "./sections/documents-section";
import { SalarySection } from "./sections/salary-section";
import { EmergencyContactsSection } from "./sections/emergency-contacts-section";
import { DependentsSection } from "./sections/dependents-section";
import { QualificationsSection } from "./sections/qualifications-section";
import { ExperienceSection } from "./sections/experience-section";
import { AssetsSection } from "./sections/assets-section";
import { NotesSection } from "./sections/notes-section";
import { ActivitySection } from "./sections/activity-section";

export function EmployeeProfile({
  profile,
  options,
  activity,
  canUpdate,
  canDelete,
}: {
  profile: Profile;
  options: EmployeeFormOptions;
  activity: AuditLogRow[];
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const e = profile.employee;
  const [editOpen, setEditOpen] = React.useState(false);
  const [statusPending, setStatusPending] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const fullName = `${e.first_name} ${e.last_name}`;

  async function onStatusChange(status: EmployeeStatus) {
    setStatusPending(true);
    const result = await setEmployeeStatus({ id: e.id, status });
    setStatusPending(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Status updated.");
    router.refresh();
  }

  async function onDelete() {
    if (!window.confirm(`Delete ${fullName}? This can be restored later.`)) {
      return;
    }
    setDeleting(true);
    const result = await deleteEmployee({ id: e.id });
    if (!result.success) {
      setDeleting(false);
      return toast.error(result.error);
    }
    toast.success("Employee deleted.");
    router.push(ROUTES.employees);
  }

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.employees}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to employees
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <EmployeeImageUploader
            employeeId={e.id}
            kind="photo"
            canManage={canUpdate}
          >
            <Avatar className="size-16">
              <AvatarImage src={e.photo_url ?? undefined} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-lg text-primary">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
          </EmployeeImageUploader>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                {fullName}
              </h1>
              <EmployeeStatusBadge status={e.status as EmployeeStatus} />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono">{e.employee_code}</span>
              {profile.designationName ? ` · ${profile.designationName}` : ""}
              {profile.departmentName ? ` · ${profile.departmentName}` : ""}
            </p>
            {e.date_of_joining && (
              <p className="text-xs text-subtle-foreground">
                Joined {formatDate(e.date_of_joining)}
              </p>
            )}
          </div>
        </div>

        {(canUpdate || canDelete) && (
          <div className="flex flex-wrap items-center gap-2">
            {canUpdate && (
              <Select
                value={e.status}
                onValueChange={(v) => onStatusChange(v as EmployeeStatus)}
                disabled={statusPending}
              >
                <SelectTrigger className="h-9 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {canUpdate && (
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                disabled={deleting}
                onClick={onDelete}
              >
                {deleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            {profile.canViewSalary && (
              <TabsTrigger value="salary">Salary</TabsTrigger>
            )}
            <TabsTrigger value="contacts">Emergency</TabsTrigger>
            <TabsTrigger value="dependents">Dependents</TabsTrigger>
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewSection profile={profile} canManage={canUpdate} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsSection
            employeeId={e.id}
            documents={profile.documents}
            canManage={canUpdate}
          />
        </TabsContent>
        {profile.canViewSalary && (
          <TabsContent value="salary">
            <SalarySection
              employeeId={e.id}
              salaries={profile.salaries}
              canManage={profile.canManageSalary}
            />
          </TabsContent>
        )}
        <TabsContent value="contacts">
          <EmergencyContactsSection
            employeeId={e.id}
            contacts={profile.emergencyContacts}
            canManage={canUpdate}
          />
        </TabsContent>
        <TabsContent value="dependents">
          <DependentsSection
            employeeId={e.id}
            dependents={profile.dependents}
            canManage={canUpdate}
          />
        </TabsContent>
        <TabsContent value="qualifications">
          <QualificationsSection
            employeeId={e.id}
            qualifications={profile.qualifications}
            canManage={canUpdate}
          />
        </TabsContent>
        <TabsContent value="experience">
          <ExperienceSection
            employeeId={e.id}
            experiences={profile.experiences}
            canManage={canUpdate}
          />
        </TabsContent>
        <TabsContent value="assets">
          <AssetsSection
            employeeId={e.id}
            assets={profile.assets}
            canManage={canUpdate}
          />
        </TabsContent>
        <TabsContent value="notes">
          <NotesSection
            employeeId={e.id}
            notes={profile.notes}
            canManage={canUpdate}
          />
        </TabsContent>
        <TabsContent value="activity">
          <ActivitySection activity={activity} />
        </TabsContent>
      </Tabs>

      {canUpdate && (
        <EmployeeFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          employee={e}
          options={options}
        />
      )}
    </div>
  );
}
