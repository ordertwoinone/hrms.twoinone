"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency, formatDate } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import { EmptyState } from "@/components/shared/empty-state";
import { ActionMenu } from "@/components/shared/action-menu";
import {
  addSalary,
  deleteSalary,
  updateSalary,
} from "../../actions/employee-sections.actions";
import { salarySchema, type SalaryInput } from "../../schemas/sections.schema";
import type { EmployeeSalary } from "../../types";
import { SectionCard } from "../section-card";

function gross(s: EmployeeSalary) {
  return (
    s.basic +
    s.housing_allowance +
    s.transport_allowance +
    s.other_allowances -
    s.deductions
  );
}

export function SalarySection({
  employeeId,
  salaries,
  canManage,
}: {
  employeeId: string;
  salaries: EmployeeSalary[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmployeeSalary | null>(null);
  const current = salaries[0];

  async function onDelete(id: string) {
    const result = await deleteSalary({ id });
    if (!result.success) return toast.error(result.error);
    toast.success("Salary record removed.");
    router.refresh();
  }

  return (
    <SectionCard
      title="Salary"
      description="Current salary structure and history."
      action={
        canManage ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add
          </Button>
        ) : null
      }
    >
      {salaries.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No salary records"
          description="Add a salary structure to get started."
          className="border-0"
        />
      ) : (
        <div className="space-y-5">
          {current && (
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Current gross · effective {formatDate(current.effective_date)}
                </p>
              </div>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {formatCurrency(gross(current), current.currency)}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
                {[
                  ["Basic", current.basic],
                  ["Housing", current.housing_allowance],
                  ["Transport", current.transport_allowance],
                  ["Other", current.other_allowances],
                  ["Deductions", -current.deductions],
                ].map(([label, amount]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>{formatCurrency(Number(amount), current.currency)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {salaries.length > 1 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle-foreground">
                History
              </p>
              <ul className="divide-y">
                {salaries.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(gross(s), s.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Effective {formatDate(s.effective_date)}
                      </p>
                    </div>
                    {canManage && (
                      <ActionMenu
                        groups={[
                          [
                            {
                              label: "Edit",
                              icon: Pencil,
                              onSelect: () => {
                                setEditing(s);
                                setOpen(true);
                              },
                            },
                          ],
                          [
                            {
                              label: "Delete",
                              icon: Trash2,
                              destructive: true,
                              onSelect: () => void onDelete(s.id),
                            },
                          ],
                        ]}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {canManage && (
        <SalaryDialog
          key={editing?.id ?? "new"}
          open={open}
          onOpenChange={setOpen}
          employeeId={employeeId}
          salary={editing}
        />
      )}
    </SectionCard>
  );
}

function SalaryDialog({
  open,
  onOpenChange,
  employeeId,
  salary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  salary: EmployeeSalary | null;
}) {
  const router = useRouter();
  const form = useForm<SalaryInput>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      employee_id: employeeId,
      effective_date: salary?.effective_date ?? "",
      currency: salary?.currency ?? "AED",
      basic: salary?.basic ?? 0,
      housing_allowance: salary?.housing_allowance ?? 0,
      transport_allowance: salary?.transport_allowance ?? 0,
      other_allowances: salary?.other_allowances ?? 0,
      deductions: salary?.deductions ?? 0,
      notes: salary?.notes ?? "",
    },
  });

  async function onSubmit(values: SalaryInput) {
    const result = salary
      ? await updateSalary({ id: salary.id, ...values })
      : await addSalary(values);
    if (!result.success) return toast.error(result.error);
    toast.success(salary ? "Salary updated." : "Salary added.");
    onOpenChange(false);
    router.refresh();
  }

  const num = (name: keyof SalaryInput, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="number" step="0.01" min="0" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {salary ? "Edit salary" : "Add salary record"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="salary-form"
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
              {num("basic", "Basic")}
              {num("housing_allowance", "Housing")}
              {num("transport_allowance", "Transport")}
              {num("other_allowances", "Other allowances")}
              {num("deductions", "Deductions")}
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
            form="salary-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
