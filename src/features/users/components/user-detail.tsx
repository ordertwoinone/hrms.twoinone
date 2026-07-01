"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  KeyRound,
  Pencil,
  UserCheck,
  UserX,
  History,
} from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import type { Role } from "@/config/roles";
import {
  formatDate,
  formatDateTime,
  formatRelative,
  getInitials,
} from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { setUserStatus } from "../actions/user.actions";
import type { AuditLogRow, UserDetail as UserDetailType } from "../types";
import { RoleBadge, UserStatusBadge } from "./user-badges";
import { EditUserDialog } from "./edit-user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

interface RoleOption {
  key: Role;
  name: string;
}

export function UserDetail({
  user,
  roles,
  currentUserId,
  auditLogs,
}: {
  user: UserDetailType;
  roles: RoleOption[];
  currentUserId: string;
  auditLogs: AuditLogRow[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const isSelf = user.id === currentUserId;

  async function toggleStatus() {
    const next = user.status === "active" ? "inactive" : "active";
    setPending(true);
    const result = await setUserStatus({ id: user.id, status: next });
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(next === "active" ? "User activated." : "User deactivated.");
    router.refresh();
  }

  const details: { label: string; value: React.ReactNode }[] = [
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone || "—" },
    { label: "Role", value: <RoleBadge role={user.roleKey} /> },
    { label: "Status", value: <UserStatusBadge status={user.status} /> },
    {
      label: "Last sign in",
      value: user.lastSignInAt ? formatDateTime(user.lastSignInAt) : "Never",
    },
    { label: "Joined", value: formatDate(user.createdAt) },
    { label: "Last updated", value: formatDate(user.updatedAt) },
  ];

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.users}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to users
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage
              src={user.avatarUrl ?? undefined}
              alt={user.fullName}
            />
            <AvatarFallback className="bg-primary/10 text-base text-primary">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {user.fullName}
            </h1>
            <div className="flex items-center gap-2">
              <RoleBadge role={user.roleKey} />
              <UserStatusBadge status={user.status} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <KeyRound className="size-4" />
            Reset password
          </Button>
          <Button
            variant="outline"
            disabled={isSelf || pending}
            onClick={toggleStatus}
            className={
              user.status === "active"
                ? "text-destructive hover:text-destructive"
                : undefined
            }
          >
            {user.status === "active" ? (
              <UserX className="size-4" />
            ) : (
              <UserCheck className="size-4" />
            )}
            {user.status === "active" ? "Deactivate" : "Activate"}
          </Button>
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audit">
            <History className="size-4" />
            Audit history
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {details.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1 border-b pb-3 last:border-0"
                  >
                    <dt className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
                      {item.label}
                    </dt>
                    <dd className="text-sm">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit history</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No activity yet"
                  description="Changes to this user will appear here."
                  className="border-0"
                />
              ) : (
                <ol className="relative space-y-5 border-l pl-5">
                  {auditLogs.map((log) => (
                    <li key={log.id} className="relative">
                      <span className="absolute -left-[1.45rem] top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium capitalize">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        <time className="text-xs text-subtle-foreground">
                          {formatRelative(log.created_at)}
                        </time>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(log.created_at)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        roles={roles}
      />
      <ResetPasswordDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        user={user}
      />
    </div>
  );
}
