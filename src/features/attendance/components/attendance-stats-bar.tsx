"use client";

import { Users, UserCheck, UserX, Clock, Timer } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import type { AttendanceSummary } from "../types";

interface Props {
  summary: AttendanceSummary;
}

export function AttendanceStatsBar({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Present" value={summary.present} icon={UserCheck} />
      <StatCard label="Absent" value={summary.absent} icon={UserX} />
      <StatCard label="Late" value={summary.late} icon={Clock} />
      <StatCard label="On Leave" value={summary.onLeave} icon={Users} />
      <StatCard label="Overtime Hours" value={`${summary.totalOvertimeHours}h`} icon={Timer} />
    </div>
  );
}
