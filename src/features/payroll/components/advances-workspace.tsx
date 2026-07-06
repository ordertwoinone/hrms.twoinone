"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HandCoins, Plus, CheckCircle, XCircle, Play, Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency, formatDate } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable } from "@/components/data-table/data-table";
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
import type { AdvanceListItem, PayrollFormOptions } from "../types";
import type { AdvanceSummary } from "../queries/advances.queries";
import { ADVANCE_STATUSES } from "../constants";
import { advanceFormSchema, type AdvanceFormInput } from "../schemas/payroll.schema";
import {
  createAdvance,
  approveAdvance,
  activateAdvance,
  rejectAdvance,
  cancelAdvance,
} from "../actions/advance.actions";

export function AdvancesWorkspace({
  advances,
  summary,
  options,
  canManage,
}: {
  advances: AdvanceListItem[];
  summary: AdvanceSummary;
  options: PayrollFormOptions;
  canManage: boolean;
}) {
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);
  const [confirmTarget, setConfirmTarget] = React.useState<{
    id: string;
    action: "approve" | "activate" | "reject" | "cancel";
    name: string;
  } | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleConfirm() {
    if (!confirmTarget) return;
    setBusy(true);
    const input = { id: confirmTarget.id };
    let result;
    if (confirmTarget.action === "approve") result = await approveAdvance(input);
    else if (confirmTarget.action === "activate") result = await activateAdvance(input);
    else if (confirmTarget.action === "reject") result = await rejectAdvance(input);
    else result = await cancelAdvance(input);
    setBusy(false);
    if (!result.success) { toast.error(result.error); return; }
    toast.success(`Advance ${confirmTarget.action}d.`);
    setConfirmTarget(null);
    router.refresh();
  }

  const columns = [
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: ({ row }: { row: { original: AdvanceListItem } }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          {row.original.employeeCode && (
            <p className="text-xs text-muted-foreground">{row.original.employeeCode}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: { row: { original: AdvanceListItem } }) => (
        <span className="tabular-nums font-medium">{formatCurrency(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "outstanding",
      header: "Outstanding",
      cell: ({ row }: { row: { original: AdvanceListItem } }) => (
        <span className="tabular-nums text-sm">{formatCurrency(row.original.outstanding)}</span>
      ),
    },
    {
      accessorKey: "repaymentMonths",
      header: "Repayment",
      cell: ({ row }: { row: { original: AdvanceListItem } }) => (
        <span className="text-sm">
          {formatCurrency(row.original.monthlyDeduction)}/mo × {row.original.repaymentMonths}
        </span>
      ),
    },
    {
      accessorKey: "advanceDate",
      header: "Date",
      cell: ({ row }: { row: { original: AdvanceListItem } }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.advanceDate)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: AdvanceListItem } }) => {
        const s = ADVANCE_STATUSES.find((x) => x.value === row.original.status);
        return <Badge variant={s?.variant ?? "outline"}>{s?.label ?? row.original.status}</Badge>;
      },
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: AdvanceListItem } }) => {
              const adv = row.original;
              return (
                <div className="flex gap-1">
                  {adv.status === "pending" && (
                    <>
                      <Button size="sm" variant="ghost" className="text-success h-7 w-7 p-0"
                        title="Approve"
                        onClick={() => setConfirmTarget({ id: adv.id, action: "approve", name: adv.employeeName })}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0"
                        title="Reject"
                        onClick={() => setConfirmTarget({ id: adv.id, action: "reject", name: adv.employeeName })}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {adv.status === "approved" && (
                    <Button size="sm" variant="ghost" className="text-primary h-7 w-7 p-0"
                      title="Activate"
                      onClick={() => setConfirmTarget({ id: adv.id, action: "activate", name: adv.employeeName })}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {["pending", "approved"].includes(adv.status) && (
                    <Button size="sm" variant="ghost" className="text-muted-foreground h-7 w-7 p-0"
                      title="Cancel"
                      onClick={() => setConfirmTarget({ id: adv.id, action: "cancel", name: adv.employeeName })}>
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending requests" value={summary.pending} icon={HandCoins} />
        <StatCard label="Active advances" value={summary.active} icon={HandCoins} />
        <StatCard label="Total outstanding" value={formatCurrency(summary.totalOutstanding)} icon={HandCoins} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Salary Advances</CardTitle>
          {canManage && (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-1 h-4 w-4" /> New Advance
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {advances.length === 0 ? (
            <EmptyState icon={HandCoins} title="No advances" description="No salary advance requests yet." />
          ) : (
            <DataTable columns={columns} data={advances} searchPlaceholder="Search employee…" />
          )}
        </CardContent>
      </Card>

      {creating && canManage && (
        <AdvanceFormDialog
          options={options}
          onClose={() => setCreating(false)}
          onSuccess={() => { setCreating(false); router.refresh(); }}
        />
      )}

      <Dialog open={!!confirmTarget} onOpenChange={() => setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.action === "approve" && "Approve advance"}
              {confirmTarget?.action === "activate" && "Activate advance"}
              {confirmTarget?.action === "reject" && "Reject advance"}
              {confirmTarget?.action === "cancel" && "Cancel advance"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmTarget?.action === "approve" && `Approve the salary advance for ${confirmTarget.name}?`}
            {confirmTarget?.action === "activate" && `Mark advance as active and begin monthly deductions for ${confirmTarget.name}?`}
            {confirmTarget?.action === "reject" && `Reject the salary advance request for ${confirmTarget.name}?`}
            {confirmTarget?.action === "cancel" && `Cancel the salary advance for ${confirmTarget.name}? This cannot be undone.`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)} disabled={busy}>
              Go back
            </Button>
            <Button
              variant={["reject", "cancel"].includes(confirmTarget?.action ?? "") ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdvanceFormDialog({
  options,
  onClose,
  onSuccess,
}: {
  options: PayrollFormOptions;
  onClose: () => void;
  onSuccess: () => void;
}) {
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
    onSuccess();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Salary Advance</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="advance-form" className="space-y-4">
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
          <Button type="submit" form="advance-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
