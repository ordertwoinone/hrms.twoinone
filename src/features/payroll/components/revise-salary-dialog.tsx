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
import { reviseSalary } from "../actions/payroll.actions";
import {
  reviseSalarySchema,
  type ReviseSalaryInput,
} from "../schemas/payroll.schema";
import type { SalaryStructureItem } from "../types";

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

  const form = useForm<ReviseSalaryInput>({
    resolver: zodResolver(reviseSalarySchema),
    values: employee
      ? {
          employee_id: employee.employeeId,
          effective_date: new Date().toISOString().slice(0, 10),
          currency: employee.currency,
          basic: employee.basic,
          housing_allowance: employee.housing,
          transport_allowance: employee.transport,
          other_allowances: employee.other,
          deductions: employee.deductions,
          notes: "",
        }
      : undefined,
  });

  const values = form.watch();
  const gross =
    Number(values.basic || 0) +
    Number(values.housing_allowance || 0) +
    Number(values.transport_allowance || 0) +
    Number(values.other_allowances || 0);

  async function onSubmit(input: ReviseSalaryInput) {
    const result = await reviseSalary(input);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Salary revised.");
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
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revise salary</DialogTitle>
          <DialogDescription>
            {employee?.employeeName} · a new dated structure is created, keeping
            history.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="revise-salary-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="effective_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {money("basic", "Basic salary")}
              {money("housing_allowance", "Housing allowance")}
              {money("transport_allowance", "Transport allowance")}
              {money("other_allowances", "Other allowances")}
              {money("deductions", "Fixed deductions")}
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Gross salary</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(gross, values.currency || "AED")}
              </span>
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
            form="revise-salary-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : null}
            Save revision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
