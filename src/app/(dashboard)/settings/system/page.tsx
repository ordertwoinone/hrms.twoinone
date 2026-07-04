import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "System Preferences — Settings",
};

export default async function SystemPreferencesPage() {
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
        title="System Preferences"
        description="Date formats, language, locale, and global application behaviour."
      />
      <EmptyState
        icon={SlidersHorizontal}
        title="Coming soon"
        description="System preference controls will be available in the next release."
      />
    </div>
  );
}
