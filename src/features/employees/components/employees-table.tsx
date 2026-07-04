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
import { Eye, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { getInitials } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { deleteEmployee } from "../actions/employee.actions";
import { EMPLOYEE_STATUSES } from "../constants";
import type { EmployeeFormOptions, EmployeeListItem } from "../types";
import { EmployeeStatusBadge } from "./employee-status-badge";
import { EmployeeFormDialog } from "./employee-form-dialog";

export function EmployeesTable({
  employees,
  options,
  canCreate,
  canUpdate,
  canDelete,
}: {
  employees: EmployeeListItem[];
  options: EmployeeFormOptions;
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
  const [createOpen, setCreateOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onDelete(item: EmployeeListItem) {
    if (
      !window.confirm(`Delete ${item.fullName}? This can be restored later.`)
    ) {
      return;
    }
    setPendingId(item.id);
    const result = await deleteEmployee({ id: item.id });
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Employee deleted.");
    router.refresh();
  }

  const columns = React.useMemo<ColumnDef<EmployeeListItem>[]>(
    () => [
      {
        id: "employee",
        accessorFn: (row) =>
          `${row.fullName} ${row.code} ${row.workEmail ?? ""}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Employee" />
        ),
        cell: ({ row }) => {
          const e = row.original;
          return (
            <Link
              href={`${ROUTES.employees}/${e.id}`}
              className="flex items-center gap-3"
            >
              <Avatar className="size-9">
                <AvatarImage src={e.photoUrl ?? undefined} alt={e.fullName} />
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {getInitials(e.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium hover:underline">
                  {e.fullName}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {e.code}
                </p>
              </div>
            </Link>
          );
        },
      },
      {
        id: "department",
        accessorFn: (row) => row.departmentId ?? "",
        header: "Department",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => (
          <div className="text-sm">
            <p>{row.original.departmentName || "—"}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.designationName || "—"}
            </p>
          </div>
        ),
      },
      {
        id: "branch",
        accessorFn: (row) => row.branchName ?? "",
        header: "Branch",
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.branchName || "—"}</span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => <EmployeeStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const e = row.original;
          const group: ActionMenuItem[] = [
            {
              label: "View profile",
              icon: Eye,
              onSelect: () => router.push(`${ROUTES.employees}/${e.id}`),
            },
          ];
          if (canUpdate) {
            group.push({
              label: "Edit",
              icon: Pencil,
              onSelect: () => router.push(`${ROUTES.employees}/${e.id}`),
            });
          }
          const groups: ActionMenuItem[][] = [group];
          if (canDelete) {
            groups.push([
              {
                label: "Delete",
                icon: Trash2,
                onSelect: () => void onDelete(e),
                destructive: true,
                disabled: pendingId === e.id,
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
    [canUpdate, canDelete, pendingId, router],
  );

  const table = useReactTable({
    data: employees,
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search name, code, email…"
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
              {options.departments.map((d) => (
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
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {EMPLOYEE_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canCreate && (
          <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add employee
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
                    icon={Users}
                    title="No employees found"
                    description={
                      canCreate
                        ? "Add your first employee to get started."
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

      {canCreate && (
        <EmployeeFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          options={options}
        />
      )}
    </div>
  );
}
