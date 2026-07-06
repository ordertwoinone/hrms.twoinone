"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { createAdvance } from "../actions/advance.actions";
import { advanceFormSchema, type AdvanceFormInput } from "../schemas/payroll.schema";
import type { PayrollFormOptions } from "../types";

export function AdvanceFormDialog({
  options,
  onClose,
}: {
  options: PayrollFormOptions;
  onClose: () => void;
}) {
  const router = useRouter();

  const form = useForm<AdvanceFormInput>({
    resolver: zodResolver(advanceFormSchema),
    defaultValues: {
      advance_date: new Date().toISOString().slice(0, 10),
      repayment_months: 1,
    },
  });

  const amount = form.watch("amount") ?? 0;
  const months = form.watch("repayment_months") ?? 1;
  const monthly = months > 0 && amount > 0 ? Math.round((amount / months) * 100) / 100 : 0;

  async function onSubmit(data: AdvanceFormInput) {
    const result = await createAdvance(data);
    if (!result.success) { toast.error(result.error); return; }
    toast.success("Advance request submitted.");
    onClose();
    router.refresh();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Salary Advance</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form id="advance-dialog-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select employee…" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {options.employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}{e.code ? ` (${e.code})` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (AED)</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="1" {...field} onChange={(e) => field.onChange(e.target.value)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="repayment_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repayment months</FormLabel>
                    <FormControl><Input type="number" min="1" max="24" {...field} onChange={(e) => field.onChange(e.target.value)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {monthly > 0 && (
              <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                Monthly deduction: <strong>AED {monthly.toFixed(2)}</strong>
              </p>
            )}
            <FormField control={form.control} name="advance_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advance date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="Reason for advance…" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="advance-dialog-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
