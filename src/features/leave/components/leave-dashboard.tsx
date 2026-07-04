import { CalendarCheck, CalendarClock, Plane, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { AreaChartCard } from "@/components/shared/area-chart-card";
import type { LeaveDashboardData } from "../types";

export function LeaveDashboard({ data }: { data: LeaveDashboardData }) {
  const maxType = Math.max(1, ...data.byType.map((t) => t.value));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending approvals"
          value={data.pending}
          icon={CalendarClock}
        />
        <StatCard
          label="On leave today"
          value={data.onLeaveToday}
          icon={Plane}
        />
        <StatCard
          label="Approved this month"
          value={data.approvedThisMonth}
          icon={CalendarCheck}
        />
        <StatCard
          label="Rejected this month"
          value={data.rejectedThisMonth}
          icon={XCircle}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AreaChartCard title="Leave days by month" data={data.byMonth} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Days by leave type</CardTitle>
          </CardHeader>
          <CardContent>
            {data.byType.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No approved leave yet this year.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.byType.map((t) => (
                  <li key={t.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {t.value}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(t.value / maxType) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
