"use client";

import { Printer } from "lucide-react";

import { formatCurrency } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { PayslipItem } from "../types";

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>
        {value}
      </span>
    </div>
  );
}

/** Opens a print-only window with the payslip (Save as PDF from the print dialog). */
function printPayslip(p: PayslipItem, period: string, orgName: string) {
  const c = (n: number) => formatCurrency(n, p.currency);
  const line = (l: string, v: number) =>
    `<tr><td>${l}</td><td style="text-align:right">${c(v)}</td></tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Payslip - ${p.employeeName} - ${period}</title>
<style>
  body{font-family:ui-sans-serif,system-ui,Arial,sans-serif;color:#0f172a;margin:40px;}
  h1{font-size:18px;margin:0}
  h2{font-size:13px;color:#475569;margin:2px 0 16px;font-weight:500}
  table{width:100%;border-collapse:collapse;font-size:13px}
  td{padding:6px 0;border-bottom:1px solid #e2e8f0}
  .cols{display:flex;gap:24px}
  .cols>div{flex:1}
  .h{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:20px 0 6px}
  .net{margin-top:24px;padding:14px 16px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;display:flex;justify-content:space-between;align-items:center}
  .net b{font-size:18px}
  .meta{font-size:12px;color:#64748b;margin-bottom:20px}
</style></head><body>
  <h1>${orgName}</h1>
  <h2>Payslip · ${period}</h2>
  <div class="meta"><b>${p.employeeName}</b>${p.employeeCode ? " · " + p.employeeCode : ""}</div>
  <div class="cols">
    <div>
      <div class="h">Earnings</div>
      <table>
        ${line("Basic salary", p.basic)}
        ${line("Housing allowance", p.housing)}
        ${line("Transport allowance", p.transport)}
        ${line("Other allowances", p.other)}
        ${line("Overtime", p.overtime)}
        ${line("Bonus", p.bonus)}
        ${line("Commission", p.commission)}
        <tr><td><b>Gross</b></td><td style="text-align:right"><b>${c(p.gross)}</b></td></tr>
      </table>
    </div>
    <div>
      <div class="h">Deductions</div>
      <table>
        ${line("Deductions", p.deductions)}
        ${line("Loan deduction", p.loanDeduction)}
        ${line("Tax", p.tax)}
        <tr><td><b>Total</b></td><td style="text-align:right"><b>${c(p.deductions + p.loanDeduction + p.tax)}</b></td></tr>
      </table>
    </div>
  </div>
  <div class="net"><span>Net pay</span><b>${c(p.net)}</b></div>
  ${p.notes ? `<p style="font-size:12px;color:#64748b;margin-top:16px">${p.notes}</p>` : ""}
  <script>window.onload=function(){window.print();}</script>
</body></html>`;
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

export function PayslipViewDialog({
  open,
  onOpenChange,
  payslip,
  period,
  orgName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslip: PayslipItem | null;
  period: string;
  orgName: string;
}) {
  if (!payslip) return null;
  const c = (n: number) => formatCurrency(n, payslip.currency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payslip · {period}</DialogTitle>
        </DialogHeader>

        <div>
          <p className="text-sm font-semibold">{payslip.employeeName}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {payslip.employeeCode ?? "—"}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Earnings
          </p>
          <Row label="Basic salary" value={c(payslip.basic)} />
          <Row label="Housing" value={c(payslip.housing)} />
          <Row label="Transport" value={c(payslip.transport)} />
          <Row label="Other allowances" value={c(payslip.other)} />
          <Row label="Overtime" value={c(payslip.overtime)} />
          <Row label="Bonus" value={c(payslip.bonus)} />
          <Row label="Commission" value={c(payslip.commission)} />
          <Separator className="my-1" />
          <Row label="Gross" value={c(payslip.gross)} strong />
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Deductions
          </p>
          <Row label="Deductions" value={c(payslip.deductions)} />
          <Row label="Loan deduction" value={c(payslip.loanDeduction)} />
          <Row label="Tax" value={c(payslip.tax)} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium">Net pay</span>
          <span className="text-lg font-semibold tabular-nums text-primary">
            {c(payslip.net)}
          </span>
        </div>

        <Button
          className="w-full"
          onClick={() => printPayslip(payslip, period, orgName)}
        >
          <Printer className="size-4" />
          Print / Save as PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}
