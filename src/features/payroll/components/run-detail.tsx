"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Check,
  CheckCheck,
  FileDown,
  Loader2,
  Pencil,
  Printer,
  Send,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { formatCurrency, formatDate } from "@/utils";
import type { ActionResult } from "@/types/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
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
import {
  approvePayrollRun,
  cancelPayrollRun,
  markPayrollRunPaid,
  submitPayrollRun,
} from "../actions/payroll.actions";
import type { PayrollRunDetail, PayslipItem } from "../types";
import { RunStatusBadge } from "./payroll-badges";
import { PayslipEditDialog } from "./payslip-edit-dialog";
import { PayslipViewDialog } from "./payslip-view-dialog";

function downloadCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows]
    .map((r) => r.map(escape).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function RunDetailView({
  run,
  orgName,
  canProcess,
  canApprove,
}: {
  run: PayrollRunDetail;
  orgName: string;
  canProcess: boolean;
  canApprove: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [editing, setEditing] = React.useState<PayslipItem | null>(null);
  const [viewing, setViewing] = React.useState<PayslipItem | null>(null);

  async function run_(
    fn: (input: { run_id: string }) => Promise<ActionResult<{ ok: boolean }>>,
    confirmMsg: string,
    successMsg: string,
  ) {
    if (!window.confirm(confirmMsg)) return;
    setBusy(true);
    const result = await fn({ run_id: run.id });
    setBusy(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(successMsg);
    router.refresh();
  }

  function exportBankTransfer() {
    downloadCsv(
      `bank-transfer-${run.periodLabel.replace(/\s/g, "-")}.csv`,
      ["Employee", "Employee Code", "Net Amount", "Currency"],
      run.payslips.map((p) => [
        p.employeeName,
        p.employeeCode ?? "",
        p.net,
        p.currency,
      ]),
    );
  }

  function exportPayslipsExcel() {
    downloadCsv(
      `payslips-${run.periodLabel.replace(/\s/g, "-")}.csv`,
      [
        "Employee",
        "Code",
        "Basic",
        "Housing",
        "Transport",
        "Other",
        "Overtime",
        "Bonus",
        "Commission",
        "Gross",
        "Deductions",
        "Loan",
        "Tax",
        "Net",
        "Currency",
      ],
      run.payslips.map((p) => [
        p.employeeName,
        p.employeeCode ?? "",
        p.basic,
        p.housing,
        p.transport,
        p.other,
        p.overtime,
        p.bonus,
        p.commission,
        p.gross,
        p.deductions,
        p.loanDeduction,
        p.tax,
        p.net,
        p.currency,
      ]),
    );
  }

  const editable =
    canProcess && (run.status === "draft" || run.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {run.periodLabel}
          </h1>
          <RunStatusBadge status={run.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportPayslipsExcel}>
            <FileDown className="size-4" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportBankTransfer}>
            <Banknote className="size-4" />
            Bank transfer
          </Button>
          {busy ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : null}
          {canProcess && run.status === "draft" ? (
            <Button
              size="sm"
              onClick={() =>
                run_(
                  submitPayrollRun,
                  "Submit this run for approval?",
                  "Submitted for approval.",
                )
              }
              disabled={busy}
            >
              <Send className="size-4" />
              Submit
            </Button>
          ) : null}
          {canApprove && run.status === "pending" ? (
            <Button
              size="sm"
              onClick={() =>
                run_(approvePayrollRun, "Approve this payroll run?", "Approved.")
              }
              disabled={busy}
            >
              <Check className="size-4" />
              Approve
            </Button>
          ) : null}
          {canProcess && run.status === "approved" ? (
            <Button
              size="sm"
              onClick={() =>
                run_(
                  markPayrollRunPaid,
                  "Mark this run as paid? Loan balances will be updated.",
                  "Marked as paid.",
                )
              }
              disabled={busy}
            >
              <CheckCheck className="size-4" />
              Mark paid
            </Button>
          ) : null}
          {canProcess &&
          run.status !== "paid" &&
          run.status !== "cancelled" ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() =>
                run_(cancelPayrollRun, "Cancel this payroll run?", "Cancelled.")
              }
              disabled={busy}
            >
              <X className="size-4" />
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Employees"
          value={run.employeeCount}
          icon={Users}
        />
        <StatCard
          label="Gross"
          value={formatCurrency(run.totalGross, run.currency)}
          icon={Wallet}
        />
        <StatCard
          label="Deductions"
          value={formatCurrency(run.totalDeductions, run.currency)}
          icon={Wallet}
        />
        <StatCard
          label="Net payable"
          value={formatCurrency(run.totalNet, run.currency)}
          icon={Banknote}
        />
      </div>

      {run.approvedByName ? (
        <p className="text-sm text-muted-foreground">
          Approved by {run.approvedByName} on {formatDate(run.approvedAt)}
          {run.paidAt ? ` · Paid ${formatDate(run.paidAt)}` : ""}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payslips</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto p-0">
          <Table className="[&_td]:py-3">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Basic</TableHead>
                <TableHead className="text-right">Allowances</TableHead>
                <TableHead className="text-right">Additions</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {run.payslips.map((p) => {
                const groups: ActionMenuItem[][] = [
                  [
                    {
                      label: "View / print",
                      icon: Printer,
                      onSelect: () => setViewing(p),
                    },
                  ],
                ];
                if (editable) {
                  groups[0]!.push({
                    label: "Edit",
                    icon: Pencil,
                    onSelect: () => setEditing(p),
                  });
                }
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{p.employeeName}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {p.employeeCode ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(p.basic, p.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(
                        p.housing + p.transport + p.other,
                        p.currency,
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(
                        p.overtime + p.bonus + p.commission,
                        p.currency,
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(p.gross, p.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(
                        p.deductions + p.loanDeduction + p.tax,
                        p.currency,
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(p.net, p.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ActionMenu groups={groups} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PayslipEditDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        payslip={editing}
      />
      <PayslipViewDialog
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        payslip={viewing}
        period={run.periodLabel}
        orgName={orgName}
      />
    </div>
  );
}
