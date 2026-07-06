"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gift, Plus, CheckCircle, Ban, Loader2 } from "lucide-react";
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
import type { BonusListItem, PayrollFormOptions } from "../types";
import type { BonusSummary } from "../queries/bonuses.queries";
import { BONUS_STATUSES, BONUS_TYPES, MONTHS } from "../constants";
import { bonusFormSchema, type BonusFormInput } from "../schemas/payroll.schema";
import { createBonus, approveBonus, cancelBonus } from "../actions/bonus.actions";

export function BonusesWorkspace({
  bonuses,
  summary,
  options,
  canManage,
}: {
  bonuses: BonusListItem[];
  summary: BonusSummary;
  options: PayrollFormOptions;
  canManage: boolean;
}) {
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);
  const [confirmTarget, setConfirmTarget] = React.useState<{
    id: string;
    action: "approve" | "cancel";
    name: string;
  } | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleConfirm() {
    if (!confirmTarget) return;
    setBusy(true);
    const input = { id: confirmTarget.id };
    const result =
      confirmTarget.action === "approve" ? await approveBonus(input) : await cancelBonus(input);
    setBusy(false);
    if (!result.success) { toast.error(result.error); return; }
    toast.success(`Bonus ${confirmTarget.action}d.`);
    setConfirmTarget(null);
    router.refresh();
  }

  const columns = [
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: ({ row }: { row: { original: BonusListItem } }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          {row.original.employeeCode && (
            <p className="text-xs text-muted-foreground">{row.original.employeeCode}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "bonusType",
      header: "Type",
      cell: ({ row }: { row: { original: BonusListItem } }) => {
        const t = BONUS_TYPES.find((x) => x.value === row.original.bonusType);
        return <span className="text-sm">{t?.label ?? row.original.bonusType}</span>;
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: { row: { original: BonusListItem } }) => (
        <span className="tabular-nums font-medium">{formatCurrency(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "effectiveMonth",
      header: "Period",
      cell: ({ row }: { row: { original: BonusListItem } }) => {
        const b = row.original;
        if (!b.effectiveMonth || !b.effectiveYear)
          return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm">
            {MONTHS[b.effectiveMonth - 1]} {b.effectiveYear}
          </span>
        );
      },
    },
    {
      accessorKey: "approvedAt",
      header: "Approved",
      cell: ({ row }: { row: { original: BonusListItem } }) =>
        row.original.approvedAt ? (
          <span className="text-sm text-muted-foreground">{formatDate(row.original.approvedAt)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: BonusListItem } }) => {
        const s = BONUS_STATUSES.find((x) => x.value === row.original.status);
        return <Badge variant={s?.variant ?? "outline"}>{s?.label ?? row.original.status}</Badge>;
      },
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: BonusListItem } }) => {
              const b = row.original;
              if (b.status !== "pending") return null;
              return (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="text-success h-7 w-7 p-0" title="Approve"
                    onClick={() => setConfirmTarget({ id: b.id, action: "approve", name: b.employeeName })}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground h-7 w-7 p-0" title="Cancel"
                    onClick={() => setConfirmTarget({ id: b.id, action: "cancel", name: b.employeeName })}>
                    <Ban className="h-4 w-4" />
                  </Button>
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
        <StatCard label="Pending approval" value={summary.pending} icon={Gift} />
        <StatCard label="Approved" value={summary.approved} icon={Gift} />
        <StatCard label="Total approved" value={formatCurrency(summary.totalApprovedAmount)} icon={Gift} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bonus Management</CardTitle>
          {canManage && (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add Bonus
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {bonuses.length === 0 ? (
            <EmptyState icon={Gift} title="No bonuses" description="No bonuses recorded yet." />
          ) : (
            <DataTable columns={columns} data={bonuses} searchPlaceholder="Search employee…" />
          )}
        </CardContent>
      </Card>

      {creating && canManage && (
        <BonusFormDialog options={options} onClose={() => setCreating(false)}
          onSuccess={() => { setCreating(false); router.refresh(); }} />
      )}

      <Dialog open={!!confirmTarget} onOpenChange={() => setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.action === "approve" ? "Approve bonus" : "Cancel bonus"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmTarget?.action === "approve"
              ? `Approve this bonus for ${confirmTarget?.name}? It will be included in the next payroll run for the matching period.`
              : `Cancel this bonus for ${confirmTarget?.name}?`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)} disabled={busy}>Go back</Button>
            <Button variant={confirmTarget?.action === "cancel" ? "destructive" : "default"}
              onClick={handleConfirm} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BonusFormDialog({
  options,
  onClose,
  onSuccess,
}: {
  options: PayrollFormOptions;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const now = new Date();
  const form = useForm<BonusFormInput>({
    resolver: zodResolver(bonusFormSchema),
    defaultValues: { effective_month: now.getMonth() + 1, effective_year: now.getFullYear() },
  });

  async function onSubmit(data: BonusFormInput) {
    const result = await createBonus(data);
    if (!result.success) { toast.error(result.error); return; }
    toast.success("Bonus added successfully.");
    onSuccess();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bonus</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="bonus-form" className="space-y-4">
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
              <FormField control={form.control} name="bonus_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonus type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {BONUS_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (AED)</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="1" {...field} onChange={(e) => field.onChange(e.target.value)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="effective_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {MONTHS.map((m, i) => (
                          <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="effective_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(e.target.value)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField control={form.control} name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="Reason for bonus…" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="bonus-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Add Bonus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
