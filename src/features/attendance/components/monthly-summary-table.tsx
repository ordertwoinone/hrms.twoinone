"use client";

import { useState } from "react";
import { Pencil, Trash2, CalendarRange, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency } from "@/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteMonthlyAttendance } from "../actions/attendance.actions";
import type { MonthlyAttendanceSummaryItem } from "../types";

interface Props {
  rows: MonthlyAttendanceSummaryItem[];
  canManage: boolean;
  onEdit: (row: MonthlyAttendanceSummaryItem) => void;
  onChanged: () => void;
}

export function MonthlySummaryTable({ rows, canManage, onEdit, onChanged }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<MonthlyAttendanceSummaryItem | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    const res = await deleteMonthlyAttendance({ id: deleteTarget.id });
    setBusy(false);
    if (!res.success) { toast.error(res.error); return; }
    toast.success("Monthly summary removed");
    setDeleteTarget(null);
    onChanged();
  }

  const columns = [
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: ({ row }: { row: { original: MonthlyAttendanceSummaryItem } }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          <p className="text-xs text-muted-foreground">{row.original.employeeCode}</p>
        </div>
      ),
    },
    {
      accessorKey: "absentDays",
      header: "Absent Days",
      cell: ({ row }: { row: { original: MonthlyAttendanceSummaryItem } }) => (
        <span className="tabular-nums">{row.original.absentDays}</span>
      ),
    },
    {
      accessorKey: "absentDeduction",
      header: "Absent Deduction",
      cell: ({ row }: { row: { original: MonthlyAttendanceSummaryItem } }) => (
        <span className="tabular-nums text-destructive">{formatCurrency(row.original.absentDeduction)}</span>
      ),
    },
    {
      accessorKey: "additionalDutyHours",
      header: "Additional Duty Hours",
      cell: ({ row }: { row: { original: MonthlyAttendanceSummaryItem } }) => (
        <span className="tabular-nums">{row.original.additionalDutyHours}h</span>
      ),
    },
    {
      accessorKey: "additionalDutyPayment",
      header: "Additional Duty Payment",
      cell: ({ row }: { row: { original: MonthlyAttendanceSummaryItem } }) => (
        <span className="tabular-nums text-teal-600">{formatCurrency(row.original.additionalDutyPayment)}</span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }: { row: { original: MonthlyAttendanceSummaryItem } }) => (
        <span className="text-sm text-muted-foreground">{row.original.notes ?? "—"}</span>
      ),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: MonthlyAttendanceSummaryItem } }) => (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Edit"
                  onClick={() => onEdit(row.original)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" title="Delete"
                  onClick={() => setDeleteTarget(row.original)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={CalendarRange}
        title="No monthly summaries"
        description="No customized absence/duty figures for this month yet."
      />
    );
  }

  return (
    <>
      <DataTable columns={columns} data={rows} searchPlaceholder="Search employee…" />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove monthly summary</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remove the monthly attendance summary for {deleteTarget?.employeeName}? Payroll will fall
            back to its auto-calculated absence deduction and overtime pay for this employee.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={busy}>
              Go back
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
