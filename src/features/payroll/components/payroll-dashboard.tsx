"use client";

import Link from "next/link";
import { Clock3, HandCoins, Users, Wallet } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { formatCurrency, formatDate } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { AreaChartCard } from "@/components/shared/area-chart-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { PayrollDashboardData } from "../types";
import { RunStatusBadge } from "./payroll-badges";

export function PayrollDashboard({
  data,
  onViewRuns,
}: {
  data: PayrollDashboardData;
  onViewRuns?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={`Net · ${data.currentMonthLabel}`}
          value={formatCurrency(data.currentMonthNet, data.currency)}
          icon={Wallet}
        />
        <StatCard label="Employees paid" value={data.employeesPaid} icon={Users} />
        <StatCard
          label="Pending approval"
          value={data.pendingApprovals}
          icon={Clock3}
        />
        <StatCard
          label="Loans outstanding"
          value={formatCurrency(data.activeLoansOutstanding, data.currency)}
          icon={HandCoins}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AreaChartCard title="Net payroll by month" data={data.byMonthNet} />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent runs</CardTitle>
            {onViewRuns ? (
              <button
                type="button"
                onClick={onViewRuns}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </button>
            ) : null}
          </CardHeader>
          <CardContent>
            {data.recentRuns.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No runs yet"
                description="Create a payroll run to get started."
                className="border-0"
              />
            ) : (
              <ul className="divide-y">
                {data.recentRuns.map((r) => (
                  <li key={r.id} className="py-2.5">
                    <Link
                      href={`${ROUTES.payroll}/runs/${r.id}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium hover:underline">
                          {r.periodLabel}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.employeeCount} employees ·{" "}
                          {formatDate(r.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold tabular-nums">
                          {formatCurrency(r.totalNet, r.currency)}
                        </span>
                        <RunStatusBadge status={r.status} />
                      </div>
                    </Link>
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
