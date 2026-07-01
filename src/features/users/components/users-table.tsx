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
  Eye,
  KeyRound,
  Pencil,
  Plus,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { type Role } from "@/config/roles";
import { formatDate, formatRelative, getInitials } from "@/utils";
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
import { ActionMenu } from "@/components/shared/action-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { setUserStatus } from "../actions/user.actions";
import type { UserListItem } from "../types";
import { RoleBadge, UserStatusBadge } from "./user-badges";
import { CreateUserDialog } from "./create-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

interface RoleOption {
  key: Role;
  name: string;
}

export function UsersTable({
  users,
  roles,
  currentUserId,
}: {
  users: UserListItem[];
  roles: RoleOption[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  // Dialog state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<UserListItem | null>(null);
  const [resetUser, setResetUser] = React.useState<UserListItem | null>(null);

  const toggleStatus = React.useCallback(
    async (user: UserListItem) => {
      const next = user.status === "active" ? "inactive" : "active";
      setPendingId(user.id);
      const result = await setUserStatus({ id: user.id, status: next });
      setPendingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        next === "active" ? "User activated." : "User deactivated.",
      );
      router.refresh();
    },
    [router],
  );

  const columns = React.useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        id: "user",
        accessorFn: (row) => `${row.fullName} ${row.email}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarImage
                  src={user.avatarUrl ?? undefined}
                  alt={user.fullName}
                />
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "role",
        accessorFn: (row) => row.roleKey,
        header: "Role",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => <RoleBadge role={row.original.roleKey} />,
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        enableGlobalFilter: false,
        filterFn: "equalsString",
        cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
      },
      {
        id: "lastSignInAt",
        accessorFn: (row) => row.lastSignInAt,
        enableGlobalFilter: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Last sign in" />
        ),
        cell: ({ row }) =>
          row.original.lastSignInAt ? (
            <span className="text-sm text-muted-foreground">
              {formatRelative(row.original.lastSignInAt)}
            </span>
          ) : (
            <span className="text-sm text-subtle-foreground">Never</span>
          ),
      },
      {
        id: "createdAt",
        accessorFn: (row) => row.createdAt,
        enableGlobalFilter: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Joined" />
        ),
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
          const user = row.original;
          const isSelf = user.id === currentUserId;
          return (
            <div className="flex justify-end">
              <ActionMenu
                groups={[
                  [
                    {
                      label: "View profile",
                      icon: Eye,
                      onSelect: () => router.push(`${ROUTES.users}/${user.id}`),
                    },
                    {
                      label: "Edit",
                      icon: Pencil,
                      onSelect: () => setEditUser(user),
                    },
                  ],
                  [
                    {
                      label:
                        user.status === "active" ? "Deactivate" : "Activate",
                      icon: user.status === "active" ? UserX : UserCheck,
                      onSelect: () => void toggleStatus(user),
                      destructive: user.status === "active",
                      disabled: isSelf || pendingId === user.id,
                    },
                    {
                      label: "Reset password",
                      icon: KeyRound,
                      onSelect: () => setResetUser(user),
                    },
                  ],
                ]}
              />
            </div>
          );
        },
      },
    ],
    [currentUserId, pendingId, router, toggleStatus],
  );

  const table = useReactTable({
    data: users,
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

  const roleFilter =
    (table.getColumn("role")?.getFilterValue() as string) ?? "all";
  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string) ?? "all";

  return (
    <div className="space-y-4">
      {/* Toolbar: search + filters + add */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search name or email…"
              className="h-9 pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(value) =>
              table
                .getColumn("role")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.key} value={role.key}>
                  {role.name}
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
        <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Add user
        </Button>
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
                    title="No users found"
                    description="Try adjusting your search or filters."
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
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        roles={roles}
      />
      <EditUserDialog
        open={editUser !== null}
        onOpenChange={(open) => !open && setEditUser(null)}
        user={editUser}
        roles={roles}
      />
      <ResetPasswordDialog
        open={resetUser !== null}
        onOpenChange={(open) => !open && setResetUser(null)}
        user={resetUser}
      />
    </div>
  );
}
