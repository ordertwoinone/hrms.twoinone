import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import {
  AuditExplorer,
  getAuditLogs,
  getAuditFilterOptions,
  AUDIT_PAGE_SIZE,
} from "@/features/audit";

export const metadata: Metadata = {
  title: "Audit Log",
};

interface PageProps {
  searchParams: Promise<{
    action?: string;
    entity?: string;
    actorId?: string;
    from?: string;
    to?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AuditPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const filters = {
    action: params.action,
    entity: params.entity,
    actorId: params.actorId,
    from: params.from,
    to: params.to,
    search: params.search,
    limit: AUDIT_PAGE_SIZE,
  };

  const [{ rows, total }, options] = await Promise.all([
    getAuditLogs(filters, page),
    getAuditFilterOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Immutable record of every state change — logins, updates, deletions, approvals."
      />
      <AuditExplorer rows={rows} total={total} page={page} options={options} />
    </div>
  );
}
