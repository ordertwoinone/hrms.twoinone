import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HardDrive } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Backup & Export — Settings",
};

export default async function BackupPage() {
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
        title="Backup & Export"
        description="Download data exports and manage automated backup schedules."
      />
      <EmptyState
        icon={HardDrive}
        title="Coming soon"
        description="Backup and export controls will be available in the next release."
      />
    </div>
  );
}
