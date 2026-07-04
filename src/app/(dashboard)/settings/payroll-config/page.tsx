import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PayrollConfigForm } from "@/features/settings/components/payroll-config-form";
import { getPayrollConfig } from "@/features/settings/queries/settings.queries";

export const metadata: Metadata = { title: "Payroll Configuration — Settings" };

export default async function PayrollConfigPage() {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);
  const config = await getPayrollConfig();

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
        title="Payroll Configuration"
        description="Overtime multipliers, monthly allowances, gratuity rules, and WPS details."
      />
      <PayrollConfigForm defaults={config} />
    </div>
  );
}
