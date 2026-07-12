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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceStatsBar } from "./attendance-stats-bar";
import { AttendanceTable } from "./attendance-table";
import { ManualEntryDialog } from "./manual-entry-dialog";
import { MonthlySummaryTable } from "./monthly-summary-table";
import { MonthlySummaryDialog } from "./monthly-summary-dialog";
import type {
  AttendanceListItem,
  AttendanceSummary,
  AttendanceFormOptions,
  MonthlyAttendanceSummaryItem,
} from "../types";
import { ATTENDANCE_STATUSES } from "../constants";

interface Props {
  rows: AttendanceListItem[];
  summary: AttendanceSummary;
  options: AttendanceFormOptions;
  monthlySummaries: MonthlyAttendanceSummaryItem[];
  currentMonth: string;
  canManage: boolean;
}

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

export function AttendanceWorkspace({ rows, summary, options, monthlySummaries, currentMonth, canManage }: Props) {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth);
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState<MonthlyAttendanceSummaryItem | null>(null);
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
      {/* Month + refresh (shared across tabs) */}
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

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.refresh()}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Log</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
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

            {canManage && (
              <Button className="ml-auto" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            )}
          </div>

          <AttendanceStatsBar summary={summary} />
          <AttendanceTable rows={filtered} />
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          {canManage && (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingSummary(null);
                  setSummaryDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Monthly Summary
              </Button>
            </div>
          )}
          <MonthlySummaryTable
            rows={monthlySummaries}
            canManage={canManage}
            onEdit={(row) => {
              setEditingSummary(row);
              setSummaryDialogOpen(true);
            }}
            onChanged={() => router.refresh()}
          />
        </TabsContent>
      </Tabs>

      {/* Manual entry dialog */}
      <ManualEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        options={options}
        defaultDate={new Date().toISOString().slice(0, 10)}
        onSuccess={() => router.refresh()}
      />

      {/* Monthly summary dialog */}
      <MonthlySummaryDialog
        open={summaryDialogOpen}
        onOpenChange={(open) => {
          setSummaryDialogOpen(open);
          if (!open) setEditingSummary(null);
        }}
        options={options}
        defaultMonth={month}
        editing={editingSummary}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
