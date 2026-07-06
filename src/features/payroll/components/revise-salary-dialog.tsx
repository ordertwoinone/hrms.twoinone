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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { reviseSalary } from "../actions/payroll.actions";
import { reviseSalarySchema, CURRENCY_CODES, type ReviseSalaryInput } from "../schemas/payroll.schema";
import type { SalaryStructureItem } from "../types";

type CurrencyCode = (typeof CURRENCY_CODES)[number];
function safeCurrency(v: string): CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(v) ? (v as CurrencyCode) : "AED";
}

export function ReviseSalaryDialog({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: SalaryStructureItem | null;
}) {
  const router = useRouter();

  const form = useForm<ReviseSalaryInput, object, ReviseSalaryInput>({
    resolver: zodResolver(reviseSalarySchema),
    values: employee
      ? {
          employee_id: employee.employeeId,
          effective_date: new Date().toISOString().slice(0, 10),
          currency: safeCurrency(employee.currency),
          basic: employee.basic,
          housing_allowance: employee.housing,
          transport_allowance: employee.transport,
          food_allowance: employee.food,
          telephone_allowance: employee.telephone,
          other_allowances: employee.other,
          commission_fixed: employee.commissionFixed,
          deductions: employee.deductions,
          overtime_rate_multiplier: employee.overtimeRateMultiplier,
          social_security_employee_pct: employee.ssEmployeePct,
          social_security_employer_pct: employee.ssEmployerPct,
          notes: "",
        }
      : undefined,
  });

  const values = form.watch();
  const gross =
    Number(values.basic || 0) +
    Number(values.housing_allowance || 0) +
    Number(values.transport_allowance || 0) +
    Number(values.food_allowance || 0) +
    Number(values.telephone_allowance || 0) +
    Number(values.other_allowances || 0) +
    Number(values.commission_fixed || 0);

  async function onSubmit(input: ReviseSalaryInput) {
    const result = await reviseSalary(input);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Salary structure revised.");
    onOpenChange(false);
    router.refresh();
  }

  const money = (name: keyof ReviseSalaryInput, label: string) => (
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revise salary structure</DialogTitle>
          <DialogDescription>
            {employee?.employeeName} · a new dated entry is created, keeping history.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="revise-salary-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="effective_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCY_CODES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Earnings
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {money("basic", "Basic salary")}
                {money("housing_allowance", "Housing allowance")}
                {money("transport_allowance", "Transport allowance")}
                {money("food_allowance", "Food allowance")}
                {money("telephone_allowance", "Telephone allowance")}
                {money("other_allowances", "Other allowances")}
                {money("commission_fixed", "Fixed commission")}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Deductions &amp; rates
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {money("deductions", "Fixed deductions")}
                <FormField control={form.control} name="overtime_rate_multiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OT rate multiplier</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" step="0.05"
                          {...field} value={field.value ?? 1.25}
                          onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="social_security_employee_pct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SS employee %</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="1" step="0.001"
                          {...field} value={field.value ?? 0}
                          onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="social_security_employer_pct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SS employer %</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="1" step="0.001"
                          {...field} value={field.value ?? 0}
                          onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total gross salary</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(gross, values.currency || "AED")}
              </span>
            </div>

            <FormField control={form.control} name="notes"
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="revise-salary-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
            Save revision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
