import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  await requirePermission(PERMISSIONS.DOCUMENT_VIEW);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Store, manage, and share employee documents and HR records."
      />
      <EmptyState
        icon={FileText}
        title="Coming soon"
        description="The Documents module is under active development and will be available in the next release."
      />
    </div>
  );
}
