import type { Metadata } from "next";
import { Building2 } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getCompany,
  getCompanyHolidays,
} from "@/features/company/queries/company.queries";
import { CompanyForm } from "@/features/company/components/company-form";
import { CompanyOverview } from "@/features/company/components/company-overview";
import { HolidaysCard } from "@/features/company/components/holidays-card";

export const metadata: Metadata = {
  title: "Company",
};

/**
 * Company Management. Any user with `company:view` can see the profile; only
 * Super Admin (`company:manage`) gets the editable form, logo upload, and
 * holiday management. RLS enforces the same boundary at the database.
 */
export default async function CompanyPage() {
  const user = await requirePermission(PERMISSIONS.COMPANY_VIEW);
  const company = await getCompany();

  if (!company) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Company"
          description="Your organization’s profile and work calendar."
        />
        <EmptyState
          icon={Building2}
          title="No company configured"
          description="A company profile hasn’t been set up yet."
        />
      </div>
    );
  }

  const holidays = await getCompanyHolidays(company.id);
  const canManage = hasPermission(user.permissions, PERMISSIONS.COMPANY_MANAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company"
        description="Your organization’s profile and work calendar."
      />
      {canManage ? (
        <CompanyForm company={company} />
      ) : (
        <CompanyOverview company={company} />
      )}
      <HolidaysCard
        companyId={company.id}
        holidays={holidays}
        canManage={canManage}
      />
    </div>
  );
}
