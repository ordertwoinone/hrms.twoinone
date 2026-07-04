import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentsWorkspace } from "@/features/documents/components/documents-workspace";
import {
  getDocuments,
  getDocumentCategories,
} from "@/features/documents/queries/documents.queries";

export const metadata: Metadata = { title: "Documents" };

interface PageProps {
  searchParams: Promise<{ employee?: string; category?: string; expiring?: string }>;
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  await requirePermission(PERMISSIONS.DOCUMENT_VIEW);
  const params = await searchParams;

  const [documents, categories] = await Promise.all([
    getDocuments({
      employeeId: params.employee,
      category: params.category,
      expiringWithinDays: params.expiring ? Number(params.expiring) : undefined,
    }),
    getDocumentCategories(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="View and download employee documents and HR records."
      />
      <DocumentsWorkspace documents={documents} categories={categories} />
    </div>
  );
}
