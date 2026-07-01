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
  BriefcaseBusiness,
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
import { setEmploymentTypeStatus } from "../actions/employment-type.actions";
import type { EmploymentTypeListItem } from "../types";
import {
  EmploymentTypeStatusBadge,
  SystemBadge,
} from "./employment-type-badges";
import { EmploymentTypeFormDialog } from "./employment-type-form-dialog";
import { DeleteEmploymentTypeDialog } from "./delete-employment-type-dialog";

export function EmploymentTypesTable({
  employmentTypes,
  canManage,
}: {
  employmentTypes: EmploymentTypeListItem[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<EmploymentTypeListItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    React.useState<EmploymentTypeListItem | null>(null);

  const toggleStatus = React.useCallback(
    async (item: EmploymentTypeListItem) => {
      const next = item.status === "active" ? "inactive" : "active";
      setPendingId(item.id);
      const result = await setEmploymentTypeStatus({
        id: item.id,
        status: next,
      });
      setPendingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        next === "active" ? "Type activated." : "Type deactivated.",
      );
      router.refresh();
    },
    [router],
  );

  const columns = React.useMemo<ColumnDef<EmploymentTypeListItem>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name,
        header: "Type",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.name}</span>
                {item.isSystem && <SystemBadge />}
              </div>
              {item.description ? (
                <p className="truncate text-xs text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "kind",
        accessorFn: (row) => (row.isSystem ? "system" : "custom"),
        header: "Origin",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.isSystem ? "System" : "Custom"}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <EmploymentTypeStatusBadge status={row.original.status} />
        ),
      },
      {
        id: "actions",
        enableGlobalFilter: false,
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
          ];
          // System defaults can't be deleted.
          if (!item.isSystem) {
            groups.push([
              {
                label: "Delete",
                icon: Trash2,
                onSelect: () => setDeleteTarget(item),
                destructive: true,
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
    [canManage, pendingId, toggleStatus],
  );

  const table = useReactTable({
    data: employmentTypes,
    columns,
    state: { columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const kindFilter =
    (table.getColumn("kind")?.getFilterValue() as string) ?? "all";
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
              placeholder="Search types…"
              className="h-9 pl-9"
            />
          </div>
          <Select
            value={kindFilter}
            onValueChange={(value) =>
              table
                .getColumn("kind")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All origins</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
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
            Add type
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
                    icon={BriefcaseBusiness}
                    title="No employment types found"
                    description={
                      canManage
                        ? "Add a custom employment type to get started."
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
        <EmploymentTypeFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
      <EmploymentTypeFormDialog
        open={editItem !== null}
        onOpenChange={(open) => !open && setEditItem(null)}
        employmentType={editItem}
      />
      <DeleteEmploymentTypeDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        employmentType={deleteTarget}
      />
    </div>
  );
}
