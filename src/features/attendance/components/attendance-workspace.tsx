"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AttendanceStatsBar } from "./attendance-stats-bar";
import { AttendanceTable } from "./attendance-table";
import { ManualEntryDialog } from "./manual-entry-dialog";
import type { AttendanceListItem, AttendanceSummary, AttendanceFormOptions } from "../types";
import { ATTENDANCE_STATUSES } from "../constants";

interface Props {
  rows: AttendanceListItem[];
  summary: AttendanceSummary;
  options: AttendanceFormOptions;
  currentMonth: string;
  canManage: boolean;
}

function monthOptions(): { value: string; label: string }[] {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    opts.push({ value: val, label });
  }
  return opts;
}

export function AttendanceWorkspace({ rows, summary, options, currentMonth, canManage }: Props) {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth);
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshing, startRefresh] = useTransition();

  const filtered = rows.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (employeeFilter !== "all" && r.employeeId !== employeeFilter) return false;
    return true;
  });

  const handleMonthChange = useCallback((val: string) => {
    setMonth(val);
    startRefresh(() => {
      router.push(`/attendance?month=${val}`);
    });
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={month} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions().map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ATTENDANCE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {options.employees.length > 0 && (
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {options.employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.refresh()}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          {canManage && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <AttendanceStatsBar summary={summary} />

      {/* Table */}
      <AttendanceTable rows={filtered} />

      {/* Manual entry dialog */}
      <ManualEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        options={options}
        defaultDate={new Date().toISOString().slice(0, 10)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
