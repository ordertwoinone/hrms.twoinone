"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { deleteLeaveType } from "../actions/leave.actions";
import type { LeaveType } from "../types";
import { LeaveTypeDialog } from "./leave-type-dialog";

export function LeaveTypesManager({
  leaveTypes,
  canManage,
}: {
  leaveTypes: LeaveType[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LeaveType | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onDelete(item: LeaveType) {
    if (!window.confirm(`Delete “${item.name}”?`)) return;
    setPendingId(item.id);
    const result = await deleteLeaveType({ id: item.id });
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Leave type deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {leaveTypes.length} leave type{leaveTypes.length === 1 ? "" : "s"}
        </p>
        {canManage && (
          <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add leave type
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table className="[&_td]:py-3">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Days / year</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Attachment</TableHead>
                <TableHead>Status</TableHead>
                {canManage ? <TableHead className="w-10" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveTypes.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={canManage ? 7 : 6} className="h-40">
                    <EmptyState
                      icon={Tags}
                      title="No leave types"
                      description="Add a leave type to get started."
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                leaveTypes.map((t) => {
                  const groups: ActionMenuItem[][] = [
                    [
                      {
                        label: "Edit",
                        icon: Pencil,
                        onSelect: () => setEditing(t),
                      },
                    ],
                  ];
                  if (!t.is_system) {
                    groups.push([
                      {
                        label: "Delete",
                        icon: Trash2,
                        onSelect: () => void onDelete(t),
                        destructive: true,
                        disabled: pendingId === t.id,
                      },
                    ]);
                  }
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={t.color as BadgeProps["variant"]}>
                            {t.name}
                          </Badge>
                          {t.is_system ? (
                            <Lock
                              className="size-3 text-muted-foreground"
                              aria-label="System type"
                            />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {t.code}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {t.days_per_year}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.is_paid ? "success" : "outline"}>
                          {t.is_paid ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {t.requires_attachment ? "Required" : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={t.status === "active" ? "primary" : "outline"}
                        >
                          {t.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <ActionMenu groups={groups} />
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canManage && (
        <>
          <LeaveTypeDialog open={createOpen} onOpenChange={setCreateOpen} />
          <LeaveTypeDialog
            open={!!editing}
            onOpenChange={(open) => !open && setEditing(null)}
            leaveType={editing}
          />
        </>
      )}
    </div>
  );
}
