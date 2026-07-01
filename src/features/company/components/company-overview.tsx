import { Building2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { describeWeekend, describeWorkingDays } from "../constants";
import type { Company } from "../types";

/** Read-only company profile for users with view (but not manage) access. */
export function CompanyOverview({ company }: { company: Company }) {
  const officeHours =
    company.office_start_time && company.office_end_time
      ? `${company.office_start_time.slice(0, 5)} – ${company.office_end_time.slice(0, 5)}`
      : "—";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo_url}
                  alt="Company logo"
                  className="size-full object-contain"
                />
              ) : (
                <Building2 className="size-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold">{company.name}</p>
              <p className="text-sm text-muted-foreground">{company.country}</p>
            </div>
          </div>
          <FieldGrid
            fields={[
              { label: "Trade license", value: company.trade_license_number },
              { label: "TRN", value: company.tax_registration_number },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGrid
            fields={[
              { label: "Email", value: company.email },
              { label: "Phone", value: company.phone },
              { label: "Website", value: company.website },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address &amp; locale</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGrid
            fields={[
              { label: "Address", value: company.address_line },
              { label: "City", value: company.city },
              { label: "Country", value: company.country },
              { label: "Timezone", value: company.timezone },
              { label: "Currency", value: company.currency },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Working schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGrid
            fields={[
              {
                label: "Working days",
                value: describeWorkingDays(company.working_days),
              },
              {
                label: "Weekend",
                value: describeWeekend(company.working_days),
              },
              { label: "Office hours", value: officeHours },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FieldGrid({
  fields,
}: {
  fields: { label: string; value: string | null }[];
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div
          key={f.label}
          className="flex flex-col gap-1 border-b pb-3 last:border-0"
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
            {f.label}
          </dt>
          <dd className="text-sm">{f.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
