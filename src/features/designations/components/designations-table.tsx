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
  IdCard,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { setDesignationStatus } from "../actions/designation.actions";
import type { DesignationListItem, IdNameOption } from "../types";
import { DesignationStatusBadge } from "./designation-badges";
import { DesignationFormDialog } from "./designation-form-dialog";
import { DeleteDesignationDialog } from "./delete-designation-dialog";

export function DesignationsTable({
  designations,
  departments,
  canManage,
}: {
  designations: DesignationListItem[];
  departments: IdNameOption[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<DesignationListItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    React.useState<DesignationListItem | null>(null);

  const toggleStatus = React.useCallback(
    async (item: DesignationListItem) => {
      const next = item.status === "active" ? "inactive" : "active";
      setPendingId(item.id);
      const result = await setDesignationStatus({ id: item.id, status: next });
      setPendingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        next === "active"
          ? "Designation activated."
          : "Designation deactivated.",
      );
      router.refresh();
    },
    [router],
  );

  const columns = React.useMemo<ColumnDef<DesignationListItem>[]>(
    () => [
      {
        id: "designation",
        accessorFn: (row) => `${row.name} ${row.grade ?? ""}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Designation" />
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.name}</p>
            {row.original.description ? (
              <p className="truncate text-xs text-muted-foreground">
                {row.original.description}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "department",
        accessorFn: (row) => row.departmentId ?? "",
        header: "Department",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.departmentName || "—"}</span>
        ),
      },
      {
        id: "grade",
        accessorFn: (row) => row.grade ?? "",
        header: "Grade",
        cell: ({ row }) =>
          row.original.grade ? (
            <Badge variant="outline">{row.original.grade}</Badge>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <DesignationStatusBadge status={row.original.status} />
        ),
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          if (!canManage) return null;
          const item = row.original;
          const groups: ActionMenuItem[][] = [
            [
              {
                label: "Edit",
                icon: Pencil,
                onSelect: () => setEditItem(item),
              },
              {
                label: item.status === "active" ? "Deactivate" : "Activate",
                icon: item.status === "active" ? UserX : UserCheck,
                onSelect: () => void toggleStatus(item),
                disabled: pendingId === item.id,
              },
            ],
            [
              {
                label: "Delete",
                icon: Trash2,
                onSelect: () => setDeleteTarget(item),
                destructive: true,
              },
            ],
          ];
          return (
            <div className="flex justify-end">
              <ActionMenu groups={groups} />
            </div>
          );
        },
      },
    ],
    [canManage, pendingId, toggleStatus],
  );

  const table = useReactTable({
    data: designations,
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

  const departmentFilter =
    (table.getColumn("department")?.getFilterValue() as string) ?? "all";
  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string) ?? "all";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search designations…"
              className="h-9 pl-9"
            />
          </div>
          <Select
            value={departmentFilter}
            onValueChange={(value) =>
              table
                .getColumn("department")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-48">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add designation
          </Button>
        )}
      </div>

      {/* Table */}
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
                    icon={IdCard}
                    title="No designations found"
                    description={
                      canManage
                        ? "Add your first designation to get started."
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

      {/* Dialogs */}
      {canManage && (
        <DesignationFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          departments={departments}
        />
      )}
      <DesignationFormDialog
        open={editItem !== null}
        onOpenChange={(open) => !open && setEditItem(null)}
        designation={editItem}
        departments={departments}
      />
      <DeleteDesignationDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        designation={deleteTarget}
      />
    </div>
  );
}
