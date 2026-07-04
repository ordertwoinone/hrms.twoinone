"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLoan, updateLoan } from "../actions/payroll.actions";
import { loanFormSchema, type LoanFormInput } from "../schemas/payroll.schema";
import { LOAN_STATUSES, LOAN_TYPES } from "../constants";
import type { LoanListItem, PayrollFormOptions } from "../types";

const EMPTY: LoanFormInput = {
  employee_id: "",
  loan_type: "Salary Advance",
  principal: 0,
  monthly_deduction: 0,
  outstanding: 0,
  start_date: new Date().toISOString().slice(0, 10),
  status: "active",
  notes: "",
};

export function LoanDialog({
  open,
  onOpenChange,
  options,
  loan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: PayrollFormOptions;
  loan?: LoanListItem | null;
}) {
  const router = useRouter();
  const isEdit = !!loan;

  const form = useForm<LoanFormInput>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: EMPTY,
    values: loan
      ? {
          employee_id: loan.employeeId,
          loan_type: loan.loanType,
          principal: loan.principal,
          monthly_deduction: loan.monthlyDeduction,
          outstanding: loan.outstanding,
          start_date: loan.startDate,
          status: loan.status,
          notes: loan.notes ?? "",
        }
      : undefined,
  });

  async function onSubmit(values: LoanFormInput) {
    const result = isEdit
      ? await updateLoan({ id: loan!.id, ...values })
      : await createLoan(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Loan updated." : "Loan added.");
    if (!isEdit) form.reset(EMPTY);
    onOpenChange(false);
    router.refresh();
  }

  const money = (name: keyof LoanFormInput, label: string) => (
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
          <DialogTitle>{isEdit ? "Edit loan" : "Add loan"}</DialogTitle>
          <DialogDescription>
            Monthly deductions are applied automatically during payroll runs.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="loan-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.employees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loan_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOAN_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {money("principal", "Principal")}
              {money("monthly_deduction", "Monthly deduction")}
              {money("outstanding", "Outstanding")}
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOAN_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            form="loan-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : null}
            {isEdit ? "Save changes" : "Add loan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
