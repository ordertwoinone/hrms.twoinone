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
import { CalendarOff, Eye, Plus, Search, XCircle } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
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
import { cancelLeave } from "../actions/leave.actions";
import { LEAVE_STATUSES } from "../constants";
import type { LeaveFormOptions, LeaveRequestListItem } from "../types";
import { LeaveStatusBadge } from "./leave-status-badge";
import { ApplyLeaveDialog } from "./apply-leave-dialog";

function dateRange(item: LeaveRequestListItem) {
  if (item.isHalfDay) return formatDate(item.startDate);
  if (item.startDate === item.endDate) return formatDate(item.startDate);
  return `${formatDate(item.startDate)} → ${formatDate(item.endDate)}`;
}

export function LeaveRequestsTable({
  requests,
  options,
  canRequest,
}: {
  requests: LeaveRequestListItem[];
  options: LeaveFormOptions;
  canRequest: boolean;
}) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [applyOpen, setApplyOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onCancel(item: LeaveRequestListItem) {
    if (!window.confirm("Cancel this leave request?")) return;
    setPendingId(item.id);
    const result = await cancelLeave({ id: item.id });
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Leave request cancelled.");
    router.refresh();
  }

  const columns = React.useMemo<ColumnDef<LeaveRequestListItem>[]>(
    () => [
      {
        id: "employee",
        accessorFn: (row) => `${row.employeeName} ${row.leaveTypeName}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Employee" />
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <Link
              href={`${ROUTES.leave}/${r.id}`}
              className="block min-w-0"
            >
              <p className="truncate text-sm font-medium hover:underline">
                {r.employeeName}
              </p>
              <p className="text-xs text-muted-foreground">{r.leaveTypeName}</p>
            </Link>
          );
        },
      },
      {
        id: "dates",
        header: "Dates",
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <span className="text-sm">{dateRange(row.original)}</span>
        ),
      },
      {
        id: "days",
        accessorFn: (row) => row.totalDays,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Days" />
        ),
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {row.original.totalDays}
            {row.original.isHalfDay ? (
              <span className="ml-1 text-xs text-muted-foreground">½</span>
            ) : null}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => <LeaveStatusBadge status={row.original.status} />,
      },
      {
        id: "applied",
        accessorFn: (row) => row.createdAt,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Applied" />
        ),
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          const groups: ActionMenuItem[][] = [
            [
              {
                label: "View details",
                icon: Eye,
                onSelect: () => router.push(`${ROUTES.leave}/${r.id}`),
              },
            ],
          ];
          const canCancel =
            r.status === "pending" ||
            r.status === "manager_approved" ||
            r.status === "approved";
          if (canCancel) {
            groups.push([
              {
                label: "Cancel request",
                icon: XCircle,
                onSelect: () => void onCancel(r),
                destructive: true,
                disabled: pendingId === r.id,
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
    [pendingId, router],
  );

  const table = useReactTable({
    data: requests,
    columns,
    state: { sorting, columnFilters, globalFilter },
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
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
            value={statusFilter}
            onValueChange={(value) =>
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {LEAVE_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canRequest && (
          <Button className="gap-1.5" onClick={() => setApplyOpen(true)}>
            <Plus className="size-4" />
            Apply for leave
          </Button>
        )}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-40">
                  <EmptyState
                    icon={CalendarOff}
                    title="No leave requests"
                    description={
                      canRequest
                        ? "Apply for leave to see requests here."
                        : "Requests will appear here once submitted."
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

      {canRequest && (
        <ApplyLeaveDialog
          open={applyOpen}
          onOpenChange={setApplyOpen}
          options={options}
        />
      )}
    </div>
  );
}
