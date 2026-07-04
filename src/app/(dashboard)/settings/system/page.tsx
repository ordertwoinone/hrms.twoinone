import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SystemPrefsForm } from "@/features/settings/components/system-prefs-form";
import { getSystemPreferences } from "@/features/settings/queries/settings.queries";

export const metadata: Metadata = { title: "System Preferences — Settings" };

export default async function SystemPreferencesPage() {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);
  const prefs = await getSystemPreferences();

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
        title="System Preferences"
        description="Locale, date format, work week, module visibility, and email notification settings."
      />
      <SystemPrefsForm defaults={prefs} />
    </div>
  );
}
