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
  SquareUser,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/utils";
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
  deleteLabourCard,
  getLabourCardAttachmentUrlAction,
} from "../actions/labour-card.actions";
import { LABOUR_CARD_STATUSES } from "../constants";
import type { LabourCardFormOptions, LabourCardListItem } from "../types";
import { ExpiryBadge, LabourCardStatusBadge } from "./labour-card-badges";
import { LabourCardFormDialog } from "./labour-card-form-dialog";

const EXPIRY_FILTERS = [
  { value: "expired", label: "Expired" },
  { value: "critical", label: "Within 30 days" },
  { value: "warning", label: "Within 60 days" },
  { value: "notice", label: "Within 90 days" },
  { value: "ok", label: "Valid" },
];

function exportCsv(rows: LabourCardListItem[]) {
  const headers = [
    "Employee",
    "Code",
    "Labour Card Number",
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
      r.cardNumber,
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
  a.download = `labour-cards-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function LabourCardsTable({
  records,
  options,
  canManage,
}: {
  records: LabourCardListItem[];
  options: LabourCardFormOptions;
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
  const [editing, setEditing] = React.useState<LabourCardListItem | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onDelete(item: LabourCardListItem) {
    if (!window.confirm(`Delete labour card ${item.cardNumber}?`)) return;
    setPendingId(item.id);
    const result = await deleteLabourCard({ id: item.id });
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Labour card deleted.");
    router.refresh();
  }

  async function onDownload(item: LabourCardListItem) {
    const result = await getLabourCardAttachmentUrlAction(item.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  const columns = React.useMemo<ColumnDef<LabourCardListItem>[]>(
    () => [
      {
        id: "employee",
        accessorFn: (row) =>
          `${row.employeeName} ${row.employeeCode ?? ""} ${row.cardNumber}`,
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
        id: "card",
        header: "Labour card",
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.cardNumber}</span>
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
        cell: ({ row }) => (
          <LabourCardStatusBadge status={row.original.status} />
        ),
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          const first: ActionMenuItem[] = [];
          if (canManage) {
            first.push({
              label: "Edit",
              icon: Pencil,
              onSelect: () => setEditing(c),
            });
          }
          if (c.hasAttachment) {
            first.push({
              label: "Download document",
              icon: Download,
              onSelect: () => void onDownload(c),
            });
          }
          const groups: ActionMenuItem[][] = first.length ? [first] : [];
          if (canManage) {
            groups.push([
              {
                label: "Delete",
                icon: Trash2,
                onSelect: () => void onDelete(c),
                destructive: true,
                disabled: pendingId === c.id,
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

  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string) ?? "all";
  const levelFilter =
    (table.getColumn("level")?.getFilterValue() as string) ?? "all";
  const visibleCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search employee or card number…"
              className="h-9 pl-9"
            />
          </div>
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
              {LABOUR_CARD_STATUSES.map((s) => (
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
              Add labour card
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
                    icon={SquareUser}
                    title="No labour cards found"
                    description={
                      canManage
                        ? "Add a labour card or adjust your filters."
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
          <LabourCardFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            options={options}
          />
          <LabourCardFormDialog
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
