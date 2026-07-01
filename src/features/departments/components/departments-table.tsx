"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  CornerDownRight,
  Network,
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
import { setDepartmentStatus } from "../actions/department.actions";
import type { DepartmentFormOptions, DepartmentListItem } from "../types";
import { DepartmentStatusBadge } from "./department-badges";
import { DepartmentFormDialog } from "./department-form-dialog";
import { DeleteDepartmentDialog } from "./delete-department-dialog";

export function DepartmentsTable({
  departments,
  options,
  canManage,
}: {
  departments: DepartmentListItem[];
  options: DepartmentFormOptions;
  canManage: boolean;
}) {
  const router = useRouter();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editDept, setEditDept] = React.useState<DepartmentListItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    React.useState<DepartmentListItem | null>(null);

  const toggleStatus = React.useCallback(
    async (dept: DepartmentListItem) => {
      const next = dept.status === "active" ? "inactive" : "active";
      setPendingId(dept.id);
      const result = await setDepartmentStatus({ id: dept.id, status: next });
      setPendingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        next === "active" ? "Department activated." : "Department deactivated.",
      );
      router.refresh();
    },
    [router],
  );

  const columns = React.useMemo<ColumnDef<DepartmentListItem>[]>(
    () => [
      {
        id: "department",
        accessorFn: (row) => `${row.name} ${row.code}`,
        header: "Department",
        cell: ({ row }) => {
          const d = row.original;
          return (
            <div
              className="flex items-center gap-1.5"
              style={{ paddingLeft: d.depth * 18 }}
            >
              {d.depth > 0 && (
                <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground/60" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {d.code}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "branch",
        accessorFn: (row) => row.branchId ?? "",
        header: "Branch",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.branchName || "—"}</span>
        ),
      },
      {
        id: "head",
        accessorFn: (row) => row.headName ?? "",
        header: "Head",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.headName || "—"}</span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <DepartmentStatusBadge status={row.original.status} />
        ),
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        cell: ({ row }) => {
          if (!canManage) return null;
          const dept = row.original;
          const groups: ActionMenuItem[][] = [
            [
              {
                label: "Edit",
                icon: Pencil,
                onSelect: () => setEditDept(dept),
              },
              {
                label: dept.status === "active" ? "Deactivate" : "Activate",
                icon: dept.status === "active" ? UserX : UserCheck,
                onSelect: () => void toggleStatus(dept),
                disabled: pendingId === dept.id,
              },
            ],
            [
              {
                label: "Delete",
                icon: Trash2,
                onSelect: () => setDeleteTarget(dept),
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
    data: departments,
    columns,
    state: { columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const branchFilter =
    (table.getColumn("branch")?.getFilterValue() as string) ?? "all";
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
              placeholder="Search departments…"
              className="h-9 pl-9"
            />
          </div>
          <Select
            value={branchFilter}
            onValueChange={(value) =>
              table
                .getColumn("branch")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder="All branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {options.branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
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
            Add department
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
                  <TableHead key={header.id} className="text-xs font-medium">
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
                    icon={Network}
                    title="No departments found"
                    description={
                      canManage
                        ? "Add your first department to get started."
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
        <DepartmentFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          departments={departments}
          options={options}
        />
      )}
      <DepartmentFormDialog
        open={editDept !== null}
        onOpenChange={(open) => !open && setEditDept(null)}
        department={editDept}
        departments={departments}
        options={options}
      />
      <DeleteDepartmentDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        department={deleteTarget}
      />
    </div>
  );
}
