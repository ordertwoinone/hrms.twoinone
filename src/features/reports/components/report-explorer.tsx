"use client";

import * as React from "react";
import { FileDown, FileText, Loader2, Printer, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { fetchReportAction } from "../actions/report.actions";
import { REPORT_TYPES } from "../constants";
import type { ReportDataset, ReportRow, ReportType } from "../types";

function toCsvValue(v: string | number | null) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ReportExplorer({
  initialDataset,
}: {
  initialDataset: ReportDataset;
}) {
  const [type, setType] = React.useState<ReportType>(initialDataset.type);
  const [dataset, setDataset] = React.useState<ReportDataset>(initialDataset);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  async function loadType(next: ReportType) {
    setType(next);
    setQuery("");
    setStatusFilter("all");
    setLoading(true);
    const result = await fetchReportAction(next);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setDataset(result.data);
  }

  const hasStatus = dataset.columns.some((c) => c.key === "status");
  const statuses = React.useMemo(() => {
    if (!hasStatus) return [];
    return [
      ...new Set(dataset.rows.map((r) => String(r.status ?? "")).filter(Boolean)),
    ].sort();
  }, [dataset, hasStatus]);

  const rows = React.useMemo(() => {
    const q = query.toLowerCase();
    return dataset.rows.filter((r) => {
      if (statusFilter !== "all" && String(r.status ?? "") !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return Object.values(r).some((v) =>
        String(v ?? "").toLowerCase().includes(q),
      );
    });
  }, [dataset, query, statusFilter]);

  function exportCsv(rowsToExport: ReportRow[], ext: "csv") {
    const headers = dataset.columns.map((c) => c.label);
    const lines = rowsToExport.map((r) =>
      dataset.columns.map((c) => toCsvValue(r[c.key] ?? "")).join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dataset.type}-${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf(rowsToExport: ReportRow[]) {
    const head = dataset.columns
      .map(
        (c) =>
          `<th style="text-align:${c.numeric ? "right" : "left"}">${c.label}</th>`,
      )
      .join("");
    const body = rowsToExport
      .map(
        (r) =>
          `<tr>${dataset.columns
            .map(
              (c) =>
                `<td style="text-align:${c.numeric ? "right" : "left"}">${
                  r[c.key] ?? ""
                }</td>`,
            )
            .join("")}</tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${dataset.title} report</title>
<style>
  body{font-family:ui-sans-serif,system-ui,Arial,sans-serif;color:#0f172a;margin:32px}
  h1{font-size:18px;margin:0 0 4px}
  p{color:#64748b;font-size:12px;margin:0 0 18px}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th,td{padding:6px 8px;border-bottom:1px solid #e2e8f0}
  th{background:#f8fafc;text-transform:uppercase;letter-spacing:.04em;font-size:10px;color:#475569}
</style></head><body>
  <h1>${dataset.title} report</h1>
  <p>${rowsToExport.length} records · ${new Date().toLocaleDateString()}</p>
  <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  <script>window.onload=function(){window.print();}</script>
</body></html>`;
    const w = window.open("", "_blank", "width=1000,height=800");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Select value={type} onValueChange={(v) => loadType(v as ReportType)}>
            <SelectTrigger className="h-9 w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter records…"
              className="h-9 pl-9"
            />
          </div>
          {hasStatus && statuses.length > 0 ? (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-full sm:w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCsv(rows, "csv")}
            disabled={rows.length === 0}
          >
            <FileDown className="size-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCsv(rows, "csv")}
            disabled={rows.length === 0}
          >
            <FileText className="size-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportPdf(rows)}
            disabled={rows.length === 0}
          >
            <Printer className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <Table className="[&_td]:py-2.5">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                {dataset.columns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={c.numeric ? "text-right" : undefined}
                  >
                    {c.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={dataset.columns.length} className="h-40">
                    <div className="flex items-center justify-center text-muted-foreground">
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Loading report…
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((r, i) => (
                  <TableRow key={i}>
                    {dataset.columns.map((c) => (
                      <TableCell
                        key={c.key}
                        className={
                          c.numeric
                            ? "text-right tabular-nums"
                            : "text-sm"
                        }
                      >
                        {r[c.key] ?? "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={dataset.columns.length} className="h-40">
                    <EmptyState
                      icon={FileText}
                      title="No records"
                      description="No data matches the current filters."
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="px-1 text-xs text-muted-foreground">
        {rows.length} of {dataset.rows.length} records
      </p>
    </div>
  );
}
