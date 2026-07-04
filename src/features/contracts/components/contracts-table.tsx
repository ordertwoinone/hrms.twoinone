"use client";

import * as React from "react";
import Link from "next/link";
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
  Eye,
  FileDown,
  FileSignature,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
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
import { deleteContract } from "../actions/contract.actions";
import { CONTRACT_STATUSES, CONTRACT_TYPES } from "../constants";
import type { ContractFormOptions, ContractListItem } from "../types";
import { ContractStatusBadge, ExpiryBadge } from "./contract-badges";
import { ContractFormDialog } from "./contract-form-dialog";

const EXPIRY_FILTERS = [
  { value: "expired", label: "Expired" },
  { value: "critical", label: "Within 30 days" },
  { value: "warning", label: "Within 60 days" },
  { value: "notice", label: "Within 90 days" },
];

function exportCsv(rows: ContractListItem[]) {
  const headers = [
    "Employee",
    "Code",
    "Contract Type",
    "Start Date",
    "End Date",
    "Notice Period (days)",
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
      r.contractType,
      r.startDate,
      r.endDate ?? "Open-ended",
      r.noticePeriodDays,
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
  a.download = `contracts-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ContractsTable({
  contracts,
  options,
  canManage,
}: {
  contracts: ContractListItem[];
  options: ContractFormOptions;
  canManage: boolean;
}) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ContractListItem | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onDelete(item: ContractListItem) {
    if (!window.confirm(`Delete this ${item.contractType} contract?`)) return;
    setPendingId(item.id);
    const result = await deleteContract({ id: item.id });
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Contract deleted.");
    router.refresh();
  }

  const columns = React.useMemo<ColumnDef<ContractListItem>[]>(
    () => [
      {
        id: "employee",
        accessorFn: (row) =>
          `${row.employeeName} ${row.employeeCode ?? ""} ${row.contractType}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Employee" />
        ),
        cell: ({ row }) => (
          <Link href={`${ROUTES.contracts}/${row.original.id}`} className="block min-w-0">
            <p className="truncate text-sm font-medium hover:underline">
              {row.original.employeeName}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.contractType}
            </p>
          </Link>
        ),
      },
      {
        id: "type",
        accessorFn: (row) => row.contractType,
        enableGlobalFilter: false,
        filterFn: "equalsString",
      },
      {
        id: "term",
        header: "Term",
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <span className="text-sm">
            {formatDate(row.original.startDate)}
            {" – "}
            {row.original.endDate
              ? formatDate(row.original.endDate)
              : "Open-ended"}
          </span>
        ),
      },
      {
        id: "docs",
        header: "Docs",
        enableGlobalFilter: false,
        cell: ({ row }) => {
          const c = row.original;
          const chips = [
            c.hasOfferLetter ? "Offer" : null,
            c.hasContract ? "Contract" : null,
            c.hasAttachment ? "Doc" : null,
          ].filter(Boolean) as string[];
          return chips.length ? (
            <div className="flex flex-wrap gap-1">
              {chips.map((chip) => (
                <Badge key={chip} variant="outline" className="text-[10px]">
                  {chip}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <ContractStatusBadge status={row.original.status} />
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
        id: "actions",
        enableGlobalFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          const groups: ActionMenuItem[][] = [
            [
              {
                label: "View details",
                icon: Eye,
                onSelect: () => router.push(`${ROUTES.contracts}/${c.id}`),
              },
            ],
          ];
          if (canManage) {
            groups[0]!.push({
              label: "Edit",
              icon: Pencil,
              onSelect: () => setEditing(c),
            });
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
          return (
            <div className="flex justify-end">
              <ActionMenu groups={groups} />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, pendingId, router],
  );

  const table = useReactTable({
    data: contracts,
    columns,
    state: { sorting, columnFilters, globalFilter },
    initialState: { columnVisibility: { type: false, level: false } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const typeFilter =
    (table.getColumn("type")?.getFilterValue() as string) ?? "all";
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
              placeholder="Search employee or type…"
              className="h-9 pl-9"
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              table
                .getColumn("type")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {CONTRACT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
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
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {CONTRACT_STATUSES.map((s) => (
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
              New contract
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
                    icon={FileSignature}
                    title="No contracts found"
                    description={
                      canManage
                        ? "Create a contract or adjust your filters."
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
          <ContractFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            options={options}
          />
          <ContractFormDialog
            open={!!editing}
            onOpenChange={(open) => !open && setEditing(null)}
            options={options}
            contract={editing}
          />
        </>
      )}
    </div>
  );
}
