"use client";

import {
  AlertTriangle,
  Building2,
  CalendarClock,
  FileSignature,
  Plane,
  Users,
  Wallet,
} from "lucide-react";

import { formatCurrency } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { AreaChartCard } from "@/components/shared/area-chart-card";
import type { AnalyticsOverview } from "../types";

function BarList({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate font-medium">{d.name}</span>
            <span className="tabular-nums text-muted-foreground">{d.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsOverview }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Headcount" value={data.headcount} icon={Users} />
        <StatCard label="Departments" value={data.departments} icon={Building2} />
        <StatCard label="On leave today" value={data.onLeaveToday} icon={Plane} />
        <StatCard
          label="Pending leave"
          value={data.pendingLeave}
          icon={CalendarClock}
        />
        <StatCard
          label="Active contracts"
          value={data.activeContracts}
          icon={FileSignature}
        />
        <StatCard
          label="Docs expiring ≤90d"
          value={data.docsExpiring90}
          icon={AlertTriangle}
        />
        <StatCard
          label="Last payroll net"
          value={formatCurrency(data.lastPayrollNet, data.currency)}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AreaChartCard title="Leave days by month" data={data.leaveByMonth} />
        <AreaChartCard title="Net payroll by month" data={data.payrollByMonth} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headcount by department</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={data.headcountByDepartment} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Documents expiring within 90 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={data.complianceExpiry} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
