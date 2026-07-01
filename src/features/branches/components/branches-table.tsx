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
  MapPin,
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
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { setBranchStatus } from "../actions/branch.actions";
import type { BranchListItem, ManagerOption } from "../types";
import { BranchStatusBadge } from "./branch-badges";
import { BranchFormDialog } from "./branch-form-dialog";
import { DeleteBranchDialog } from "./delete-branch-dialog";

export function BranchesTable({
  branches,
  managers,
  canCreate,
  canUpdate,
  canDelete,
}: {
  branches: BranchListItem[];
  managers: ManagerOption[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editBranch, setEditBranch] = React.useState<BranchListItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = React.useState<BranchListItem | null>(
    null,
  );

  const toggleStatus = React.useCallback(
    async (branch: BranchListItem) => {
      const next = branch.status === "active" ? "inactive" : "active";
      setPendingId(branch.id);
      const result = await setBranchStatus({ id: branch.id, status: next });
      setPendingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        next === "active" ? "Branch activated." : "Branch deactivated.",
      );
      router.refresh();
    },
    [router],
  );

  const columns = React.useMemo<ColumnDef<BranchListItem>[]>(
    () => [
      {
        id: "branch",
        accessorFn: (row) => `${row.name} ${row.code}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Branch" />
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.name}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.code}
            </p>
          </div>
        ),
      },
      {
        id: "location",
        accessorFn: (row) => `${row.city ?? ""} ${row.country}`,
        header: "Location",
        cell: ({ row }) => (
          <div className="text-sm">
            <p>{row.original.city || "—"}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.country}
            </p>
          </div>
        ),
      },
      {
        id: "manager",
        accessorFn: (row) => row.managerName ?? "",
        header: "Manager",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.managerName || "—"}</span>
        ),
      },
      {
        id: "contact",
        accessorFn: (row) => `${row.email ?? ""} ${row.phone ?? ""}`,
        header: "Contact",
        cell: ({ row }) => (
          <div className="text-sm">
            <p>{row.original.email || "—"}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.phone || "—"}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => <BranchStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const branch = row.original;
          if (!canUpdate && !canDelete) return null;

          const primary: ActionMenuItem[] = [];
          if (canUpdate) {
            primary.push({
              label: "Edit",
              icon: Pencil,
              onSelect: () => setEditBranch(branch),
            });
            primary.push({
              label: branch.status === "active" ? "Deactivate" : "Activate",
              icon: branch.status === "active" ? UserX : UserCheck,
              onSelect: () => void toggleStatus(branch),
              disabled: pendingId === branch.id,
            });
          }
          const groups: ActionMenuItem[][] = [primary];
          if (canDelete) {
            groups.push([
              {
                label: "Delete",
                icon: Trash2,
                onSelect: () => setDeleteTarget(branch),
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
    [canUpdate, canDelete, pendingId, toggleStatus],
  );

  const table = useReactTable({
    data: branches,
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
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search branches…"
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canCreate && (
          <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add branch
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
                    icon={MapPin}
                    title="No branches found"
                    description={
                      canCreate
                        ? "Add your first branch to get started."
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
      {canCreate && (
        <BranchFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          managers={managers}
        />
      )}
      <BranchFormDialog
        open={editBranch !== null}
        onOpenChange={(open) => !open && setEditBranch(null)}
        branch={editBranch}
        managers={managers}
      />
      <DeleteBranchDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        branch={deleteTarget}
      />
    </div>
  );
}
