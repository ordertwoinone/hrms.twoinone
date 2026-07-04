"use client";

import { Download, Wallet } from "lucide-react";

import { formatCurrency } from "@/utils";
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
import { EmptyState } from "@/components/shared/empty-state";
import type { EssPayslip } from "../types";

function printPayslip(p: EssPayslip, orgName: string) {
  const c = (n: number) => formatCurrency(n, p.currency);
  const line = (l: string, v: number) =>
    `<tr><td>${l}</td><td style="text-align:right">${c(v)}</td></tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Payslip ${p.periodLabel}</title>
<style>body{font-family:system-ui,Arial,sans-serif;color:#0f172a;margin:40px}h1{font-size:18px;margin:0}h2{font-size:13px;color:#475569;margin:2px 0 16px;font-weight:500}table{width:100%;border-collapse:collapse;font-size:13px}td{padding:6px 0;border-bottom:1px solid #e2e8f0}.cols{display:flex;gap:24px}.cols>div{flex:1}.h{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:20px 0 6px}.net{margin-top:24px;padding:14px 16px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;display:flex;justify-content:space-between;align-items:center}.net b{font-size:18px}.meta{font-size:12px;color:#64748b;margin-bottom:20px}</style></head><body>
<h1>${orgName}</h1><h2>Payslip · ${p.periodLabel}</h2>
<div class="meta"><b>${p.employeeName}</b></div>
<div class="cols"><div><div class="h">Earnings</div><table>
${line("Basic salary", p.basic)}${line("Housing allowance", p.housing)}${line("Transport allowance", p.transport)}${line("Other allowances", p.other)}${line("Overtime", p.overtime)}${line("Bonus", p.bonus)}${line("Commission", p.commission)}
<tr><td><b>Gross</b></td><td style="text-align:right"><b>${c(p.gross)}</b></td></tr></table></div>
<div><div class="h">Deductions</div><table>${line("Deductions", p.deductions)}${line("Loan deduction", p.loanDeduction)}${line("Tax", p.tax)}
<tr><td><b>Total</b></td><td style="text-align:right"><b>${c(p.deductions + p.loanDeduction + p.tax)}</b></td></tr></table></div></div>
<div class="net"><span>Net pay</span><b>${c(p.net)}</b></div>
<script>window.onload=function(){window.print();}</script></body></html>`;
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

export function EssPayslips({
  payslips,
  orgName,
}: {
  payslips: EssPayslip[];
  orgName: string;
}) {
  return (
    <Card>
      <CardContent className="overflow-auto p-0">
        <Table className="[&_td]:py-3">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.length ? (
              payslips.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-medium">
                    {p.periodLabel}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
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
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Download payslip"
                      onClick={() => printPayslip(p, orgName)}
                    >
                      <Download className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-32">
                  <EmptyState
                    icon={Wallet}
                    title="No payslips yet"
                    description="Payslips appear here once payroll is approved."
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
