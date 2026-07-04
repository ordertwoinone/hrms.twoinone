"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { exportAuditCsv } from "../actions/audit.actions";
import { AuditFiltersBar } from "./audit-filters-bar";
import { AuditLogTable } from "./audit-log-table";
import { AuditDetailDrawer } from "./audit-detail-drawer";
import { AUDIT_PAGE_SIZE } from "../constants";
import type { AuditFilterOptions, AuditLogItem } from "../types";

interface AuditExplorerProps {
  rows: AuditLogItem[];
  total: number;
  page: number;
  options: AuditFilterOptions;
}

export function AuditExplorer({ rows, total, page, options }: AuditExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedItem, setSelectedItem] = React.useState<AuditLogItem | null>(null);
  const [exporting, setExporting] = React.useState(false);

  const totalPages = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));

  function navigatePage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const filters = {
        action: searchParams.get("action") ?? undefined,
        entity: searchParams.get("entity") ?? undefined,
        actorId: searchParams.get("actorId") ?? undefined,
        from: searchParams.get("from") ?? undefined,
        to: searchParams.get("to") ?? undefined,
        search: searchParams.get("search") ?? undefined,
      };
      const result = await exportAuditCsv(filters);
      if (!result.success) {
        toast.error(result.error ?? "Export failed.");
        return;
      }
      if (!result.data) {
        toast.error("Export failed.");
        return;
      }
      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Audit log exported.");
    } catch {
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters + export */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <AuditFiltersBar options={options} />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
          className="shrink-0"
        >
          {exporting ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <Download className="mr-1.5 size-4" />
          )}
          Export CSV
        </Button>
      </div>

      {/* Total count */}
      <p className="text-sm text-muted-foreground">
        {total.toLocaleString()} {total === 1 ? "entry" : "entries"} found
        {totalPages > 1 && ` · page ${page} of ${totalPages}`}
      </p>

      {/* Table */}
      <AuditLogTable
        rows={rows}
        selectedId={selectedItem?.id ?? null}
        onSelect={setSelectedItem}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigatePage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigatePage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Detail drawer */}
      <AuditDetailDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
