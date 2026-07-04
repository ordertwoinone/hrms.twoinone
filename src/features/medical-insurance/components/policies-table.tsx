"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import {
  Download,
  FileDown,
  Pencil,
  Plus,
  Search,
  ShieldPlus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  ActionMenu,
  type ActionMenuItem,
} from "@/components/shared/action-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  deletePolicy,
  getPolicyAttachmentUrlAction,
} from "../actions/policy.actions";
import { POLICY_STATUSES } from "../constants";
import type { PolicyFormOptions, PolicyListItem } from "../types";
import { ExpiryBadge, PolicyStatusBadge } from "./policy-badges";
import { PolicyFormDialog } from "./policy-form-dialog";

const EXPIRY_FILTERS = [
  { value: "expired", label: "Expired" },
  { value: "critical", label: "Within 30 days" },
  { value: "warning", label: "Within 60 days" },
  { value: "notice", label: "Within 90 days" },
  { value: "ok", label: "Valid" },
];

function exportCsv(rows: PolicyListItem[]) {
  const headers = [
    "Employee",
    "Code",
    "Provider",
    "Policy Number",
    "Coverage",
    "Dependents",
    "Issue Date",
    "Expiry Date",
    "Renewal Date",
    "Status",
    "Days To Expiry",
  ];
  const escape = (v: string | number | null) => {
    const s = v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    [
      r.employeeName,
      r.employeeCode,
      r.provider,
      r.policyNumber,
      r.coverage,
      r.dependentsCovered,
      r.issueDate,
      r.expiryDate,
      r.renewalDate,
      r.status,
      r.daysToExpiry,
    ]
      .map(escape)
      .join(","),
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `medical-insurance-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function PoliciesTable({
  records,
  options,
  canManage,
}: {
  records: PolicyListItem[];
  options: PolicyFormOptions;
  canManage: boolean;
}) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "expiry", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PolicyListItem | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onDelete(item: PolicyListItem) {
    if (!window.confirm(`Delete policy ${item.policyNumber}?`)) return;
    setPendingId(item.id);
    const result = await deletePolicy({ id: item.id });
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Policy deleted.");
    router.refresh();
  }

  async function onDownload(item: PolicyListItem) {
    const result = await getPolicyAttachmentUrlAction(item.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  const columns = React.useMemo<ColumnDef<PolicyListItem>[]>(
    () => [
      {
        id: "employee",
        accessorFn: (row) =>
          `${row.employeeName} ${row.employeeCode ?? ""} ${row.policyNumber} ${row.provider}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Employee" />
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {row.original.employeeName}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.employeeCode ?? "—"}
            </p>
          </div>
        ),
      },
      {
        id: "policy",
        accessorFn: (row) => row.provider,
        header: "Policy",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-medium">{row.original.provider}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.policyNumber}
            </p>
          </div>
        ),
      },
      {
        id: "coverage",
        accessorFn: (row) => row.coverage,
        header: "Coverage",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <div className="text-sm">
            <Badge variant="outline">{row.original.coverage}</Badge>
            <p className="mt-1 text-xs text-muted-foreground">
              +{row.original.dependentsCovered} dependent
              {row.original.dependentsCovered === 1 ? "" : "s"}
            </p>
          </div>
        ),
      },
      {
        id: "expiry",
        accessorFn: (row) => row.daysToExpiry,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Expiry" />
        ),
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm">{formatDate(row.original.expiryDate)}</p>
            <ExpiryBadge
              level={row.original.expiryLevel}
              daysToExpiry={row.original.daysToExpiry}
            />
          </div>
        ),
      },
      {
        id: "level",
        accessorFn: (row) => row.expiryLevel,
        enableGlobalFilter: false,
        filterFn: "equalsString",
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => <PolicyStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original;
          const first: ActionMenuItem[] = [];
          if (canManage) {
            first.push({
              label: "Edit",
              icon: Pencil,
              onSelect: () => setEditing(p),
            });
          }
          if (p.hasAttachment) {
            first.push({
              label: "Download document",
              icon: Download,
              onSelect: () => void onDownload(p),
            });
          }
          const groups: ActionMenuItem[][] = first.length ? [first] : [];
          if (canManage) {
            groups.push([
              {
                label: "Delete",
                icon: Trash2,
                onSelect: () => void onDelete(p),
                destructive: true,
                disabled: pendingId === p.id,
              },
            ]);
          }
          return groups.length ? (
            <div className="flex justify-end">
              <ActionMenu groups={groups} />
            </div>
          ) : null;
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, pendingId],
  );

  const table = useReactTable({
    data: records,
    columns,
    state: { sorting, columnFilters, globalFilter },
    initialState: { columnVisibility: { level: false } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const providerFilter =
    (table.getColumn("policy")?.getFilterValue() as string) ?? "all";
  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string) ?? "all";
  const levelFilter =
    (table.getColumn("level")?.getFilterValue() as string) ?? "all";
  const visibleCount = table.getFilteredRowModel().rows.length;

  const providers = React.useMemo(
    () =>
      [...new Set(records.map((r) => r.provider))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [records],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search employee, provider, policy…"
              className="h-9 pl-9"
            />
          </div>
          <Select
            value={providerFilter}
            onValueChange={(value) =>
              table
                .getColumn("policy")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder="All providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              {providers.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {POLICY_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={levelFilter}
            onValueChange={(value) =>
              table
                .getColumn("level")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue placeholder="Any expiry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any expiry</SelectItem>
              {EXPIRY_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              exportCsv(table.getFilteredRowModel().rows.map((r) => r.original))
            }
            disabled={visibleCount === 0}
          >
            <FileDown className="size-4" />
            Export
          </Button>
          {canManage && (
            <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Add policy
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-auto rounded-xl border bg-card">
        <Table className="[&_td]:py-3">
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-40">
                  <EmptyState
                    icon={ShieldPlus}
                    title="No policies found"
                    description={
                      canManage
                        ? "Add a policy or adjust your filters."
                        : "Try adjusting your search or filters."
                    }
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {canManage && (
        <>
          <PolicyFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            options={options}
          />
          <PolicyFormDialog
            open={!!editing}
            onOpenChange={(open) => !open && setEditing(null)}
            options={options}
            record={editing}
          />
        </>
      )}
    </div>
  );
}
