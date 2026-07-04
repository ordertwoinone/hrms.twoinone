"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HandCoins, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { deleteLoan } from "../actions/payroll.actions";
import type { LoanListItem, PayrollFormOptions } from "../types";
import { LoanStatusBadge } from "./payroll-badges";
import { LoanDialog } from "./loan-dialog";

export function LoansTable({
  loans,
  options,
  canManage,
}: {
  loans: LoanListItem[];
  options: PayrollFormOptions;
  canManage: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LoanListItem | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onDelete(item: LoanListItem) {
    if (!window.confirm(`Delete this loan for ${item.employeeName}?`)) return;
    setPendingId(item.id);
    const result = await deleteLoan({ id: item.id });
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Loan deleted.");
    router.refresh();
  }

  const filtered = loans.filter((l) =>
    `${l.employeeName} ${l.employeeCode ?? ""} ${l.loanType}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee or type…"
            className="h-9 pl-9"
          />
        </div>
        {canManage && (
          <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add loan
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <Table className="[&_td]:py-3">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Status</TableHead>
                {canManage ? <TableHead className="w-10" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? (
                filtered.map((l) => {
                  const groups: ActionMenuItem[][] = [
                    [
                      {
                        label: "Edit",
                        icon: Pencil,
                        onSelect: () => setEditing(l),
                      },
                    ],
                    [
                      {
                        label: "Delete",
                        icon: Trash2,
                        onSelect: () => void onDelete(l),
                        destructive: true,
                        disabled: pendingId === l.id,
                      },
                    ],
                  ];
                  return (
                    <TableRow key={l.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{l.employeeName}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {l.employeeCode ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{l.loanType}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(l.principal)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatCurrency(l.monthlyDeduction)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(l.outstanding)}
                      </TableCell>
                      <TableCell>
                        <LoanStatusBadge status={l.status} />
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
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={canManage ? 7 : 6} className="h-40">
                    <EmptyState
                      icon={HandCoins}
                      title="No loans"
                      description={
                        canManage
                          ? "Add a loan to track salary deductions."
                          : "Loans will appear here once added."
                      }
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canManage && (
        <>
          <LoanDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            options={options}
          />
          <LoanDialog
            open={!!editing}
            onOpenChange={(open) => !open && setEditing(null)}
            options={options}
            loan={editing}
          />
        </>
      )}
    </div>
  );
}
