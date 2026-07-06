"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updatePayslip } from "../actions/payroll.actions";
import {
  updatePayslipSchema,
  type UpdatePayslipInput,
} from "../schemas/payroll.schema";
import { computePayslip } from "../constants";
import type { PayslipItem } from "../types";

export function PayslipEditDialog({
  open,
  onOpenChange,
  payslip,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslip: PayslipItem | null;
}) {
  const router = useRouter();

  const form = useForm<UpdatePayslipInput>({
    resolver: zodResolver(updatePayslipSchema),
    values: payslip
      ? {
          id: payslip.id,
          overtime: payslip.overtime,
          bonus: payslip.bonus,
          commission: payslip.commission,
          deductions: payslip.deductions,
          penalty: payslip.penalty,
          tax: payslip.tax,
          notes: payslip.notes ?? "",
        }
      : undefined,
  });

  const v = form.watch();
  const preview = payslip
    ? computePayslip({
        basic: payslip.basic,
        housing: payslip.housing,
        transport: payslip.transport,
        food: payslip.food,
        telephone: payslip.telephone,
        other: payslip.other,
        commissionFixed: 0,
        overtime: Number(v.overtime || 0),
        bonus: Number(v.bonus || 0),
        commission: Number(v.commission || 0),
        deductions: Number(v.deductions || 0),
        loan_deduction: payslip.loanDeduction,
        advance_deduction: payslip.advanceDeduction,
        penalty: Number(v.penalty || 0),
        tax: Number(v.tax || 0),
        ssEmployeePct: 0,
        absentDays: payslip.absentDays,
        workingDays: payslip.workingDays || 22,
      })
    : { gross: 0, net: 0 };

  async function onSubmit(input: UpdatePayslipInput) {
    const result = await updatePayslip(input);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Payslip updated.");
    onOpenChange(false);
    router.refresh();
  }

  const money = (name: keyof UpdatePayslipInput, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              step="0.01"
              {...field}
              value={field.value ?? 0}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const currency = payslip?.currency ?? "AED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit payslip</DialogTitle>
          <DialogDescription>
            {payslip?.employeeName} · adjust variable earnings and deductions.
          </DialogDescription>
        </DialogHeader>

        {payslip ? (
          <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/40 p-3 text-xs">
            <div>
              <p className="text-muted-foreground">Basic</p>
              <p className="font-medium tabular-nums">
                {formatCurrency(payslip.basic, currency)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Allowances</p>
              <p className="font-medium tabular-nums">
                {formatCurrency(
                  payslip.housing + payslip.transport + payslip.other,
                  currency,
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Loan deduction</p>
              <p className="font-medium tabular-nums">
                {formatCurrency(payslip.loanDeduction, currency)}
              </p>
            </div>
          </div>
        ) : null}

        <Form {...form}>
          <form
            id="payslip-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {money("overtime", "Overtime")}
              {money("bonus", "Bonus")}
              {money("commission", "Commission")}
              {money("penalty", "Penalty")}
              {money("deductions", "Other deductions")}
              {money("tax", "Tax")}
            </div>

            <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <div>
                <span className="text-muted-foreground">Gross </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(preview.gross, currency)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Net </span>
                <span className="font-semibold tabular-nums text-primary">
                  {formatCurrency(preview.net, currency)}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="payslip-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
