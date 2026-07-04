"use client";

import * as React from "react";
import { Loader2, SlidersHorizontal, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  allocateBalance,
  fetchLeaveBalancesAction,
} from "../actions/leave.actions";
import type { IdNameOption, LeaveBalanceItem } from "../types";

const YEARS = (() => {
  const y = new Date().getFullYear();
  return [y + 1, y, y - 1, y - 2];
})();

export function LeaveBalancesPanel({
  employees,
  canManage,
}: {
  employees: IdNameOption[];
  canManage: boolean;
}) {
  const [employeeId, setEmployeeId] = React.useState<string>(
    employees[0]?.id ?? "",
  );
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  const [balances, setBalances] = React.useState<LeaveBalanceItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [edit, setEdit] = React.useState<LeaveBalanceItem | null>(null);
  const [allocated, setAllocated] = React.useState("0");
  const [carried, setCarried] = React.useState("0");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!employeeId) {
      setBalances([]);
      return;
    }
    setLoading(true);
    const result = await fetchLeaveBalancesAction(employeeId, year);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setBalances(result.data);
  }, [employeeId, year]);

  React.useEffect(() => {
    void load();
  }, [load]);

  function openEdit(item: LeaveBalanceItem) {
    setEdit(item);
    setAllocated(String(item.allocated));
    setCarried(String(item.carriedForward));
  }

  async function saveAllocation() {
    if (!edit) return;
    setSaving(true);
    const result = await allocateBalance({
      employee_id: employeeId,
      leave_type_id: edit.leaveTypeId,
      year,
      allocated: Number(allocated),
      carried_forward: Number(carried),
    });
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Allocation updated.");
    setEdit(null);
    void load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Employee</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger className="h-9 w-full sm:w-64">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Year</Label>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className="h-9 w-full sm:w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!employeeId ? (
        <EmptyState
          icon={Users}
          title="No employee selected"
          description="Pick an employee to view their leave balances."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table className="[&_td]:py-3">
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Leave type</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Carried</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  {canManage ? <TableHead className="w-10" /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={canManage ? 7 : 6} className="h-24">
                      <div className="flex items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Loading balances…
                      </div>
                    </TableCell>
                  </TableRow>
                ) : balances.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={canManage ? 7 : 6} className="h-24">
                      <p className="text-center text-sm text-muted-foreground">
                        No active leave types.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  balances.map((b) => (
                    <TableRow key={b.leaveTypeId}>
                      <TableCell className="font-medium">
                        {b.leaveTypeName}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {b.allocated}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {b.carriedForward}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {b.used}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-warning">
                        {b.pending}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={b.available > 0 ? "success" : "outline"}
                        >
                          {b.available}
                        </Badge>
                      </TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Adjust allocation"
                            onClick={() => openEdit(b)}
                          >
                            <SlidersHorizontal className="size-4" />
                          </Button>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!edit} onOpenChange={(open) => !open && setEdit(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust allocation</DialogTitle>
            <DialogDescription>
              {edit?.leaveTypeName} · {year}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Allocated days</Label>
              <Input
                type="number"
                min={0}
                max={366}
                value={allocated}
                onChange={(e) => setAllocated(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Carried forward</Label>
              <Input
                type="number"
                min={0}
                max={366}
                value={carried}
                onChange={(e) => setCarried(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button onClick={saveAllocation} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
