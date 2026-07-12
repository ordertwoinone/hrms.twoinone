"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { upsertMonthlyAttendance } from "../actions/attendance.actions";
import type { AttendanceFormOptions, MonthlyAttendanceSummaryItem } from "../types";

const schema = z.object({
  employeeId: z.string().uuid("Select an employee"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Required"),
  absentDays: z.coerce.number().min(0),
  absentDeduction: z.coerce.number().min(0),
  additionalDutyHours: z.coerce.number().min(0),
  additionalDutyPayment: z.coerce.number().min(0),
  notes: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

function monthOptions(): { value: string; label: string }[] {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    // Use local getters, not toISOString() (UTC) — in timezones ahead of UTC,
    // converting local midnight-of-the-1st to UTC rolls back to the prior month.
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    opts.push({ value: val, label });
  }
  return opts;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: AttendanceFormOptions;
  defaultMonth: string;
  editing?: MonthlyAttendanceSummaryItem | null;
  onSuccess: () => void;
}

export function MonthlySummaryDialog({ open, onOpenChange, options, defaultMonth, editing, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: editing
      ? {
          employeeId: editing.employeeId,
          period: `${editing.periodYear}-${String(editing.periodMonth).padStart(2, "0")}`,
          absentDays: editing.absentDays,
          absentDeduction: editing.absentDeduction,
          additionalDutyHours: editing.additionalDutyHours,
          additionalDutyPayment: editing.additionalDutyPayment,
          notes: editing.notes ?? "",
        }
      : {
          employeeId: "",
          period: defaultMonth,
          absentDays: 0,
          absentDeduction: 0,
          additionalDutyHours: 0,
          additionalDutyPayment: 0,
          notes: "",
        },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const [year, month] = values.period.split("-").map(Number);
      const res = await upsertMonthlyAttendance({
        employeeId: values.employeeId,
        periodYear: year!,
        periodMonth: month!,
        absentDays: values.absentDays,
        absentDeduction: values.absentDeduction,
        additionalDutyHours: values.additionalDutyHours,
        additionalDutyPayment: values.additionalDutyPayment,
        notes: values.notes || null,
      });
      if (res.success) {
        toast.success("Monthly attendance summary saved");
        form.reset();
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.error ?? "Failed to save");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Monthly Summary" : "Add Monthly Attendance Summary"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!editing}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.employees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name} ({e.code})
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
                name="period"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Month</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!editing}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {monthOptions().map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="absentDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Absent Days</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" min="0" {...field} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="absentDeduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Absent Deduction (AED)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalDutyHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Duty Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" min="0" {...field} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalDutyPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Duty Payment (AED)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              These figures override the auto-calculated absence deduction and overtime pay
              for this employee for this month when payroll is generated.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save Summary"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
