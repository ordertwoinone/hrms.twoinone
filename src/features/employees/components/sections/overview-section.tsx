/* eslint-disable @next/next/no-img-element */
import { formatDate } from "@/utils";
import type { EmployeeProfile } from "../../types";
import { GENDERS, MARITAL_STATUSES } from "../../constants";
import { SectionCard, FieldGrid } from "../section-card";
import { EmployeeImageUploader } from "../employee-image-uploader";

const labelOf = (
  options: { value: string; label: string }[],
  value: string | null,
) => options.find((o) => o.value === value)?.label ?? value ?? "—";

export function OverviewSection({
  profile,
  canManage,
}: {
  profile: EmployeeProfile;
  canManage: boolean;
}) {
  const e = profile.employee;

  return (
    <div className="space-y-6">
      <SectionCard title="Personal details">
        <FieldGrid
          fields={[
            { label: "Work email", value: e.work_email },
            { label: "Personal email", value: e.personal_email },
            { label: "Phone", value: e.phone },
            { label: "Gender", value: labelOf(GENDERS, e.gender) },
            {
              label: "Date of birth",
              value: e.date_of_birth ? formatDate(e.date_of_birth) : "—",
            },
            {
              label: "Marital status",
              value: labelOf(MARITAL_STATUSES, e.marital_status),
            },
            { label: "Nationality", value: e.nationality },
          ]}
        />
      </SectionCard>

      <SectionCard title="Job details">
        <FieldGrid
          fields={[
            { label: "Department", value: profile.departmentName },
            { label: "Designation", value: profile.designationName },
            { label: "Branch", value: profile.branchName },
            { label: "Employment type", value: profile.employmentTypeName },
            { label: "Reports to", value: profile.managerName },
            {
              label: "Date of joining",
              value: e.date_of_joining ? formatDate(e.date_of_joining) : "—",
            },
            {
              label: "Date of leaving",
              value: e.date_of_leaving ? formatDate(e.date_of_leaving) : "—",
            },
            { label: "Work location", value: e.work_location },
          ]}
        />
      </SectionCard>

      <SectionCard title="Address">
        <FieldGrid
          fields={[
            { label: "Address", value: e.address_line },
            { label: "City", value: e.city },
            { label: "Country", value: e.country },
          ]}
        />
      </SectionCard>

      <SectionCard
        title="Digital signature"
        action={
          canManage ? (
            <EmployeeImageUploader
              employeeId={e.id}
              kind="signature"
              canManage={canManage}
              buttonLabel={e.signature_url ? "Replace" : "Upload"}
            />
          ) : null
        }
      >
        {e.signature_url ? (
          <div className="flex h-28 w-full max-w-xs items-center justify-center rounded-lg border bg-white p-3">
            <img
              src={e.signature_url}
              alt="Signature"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No signature uploaded.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
