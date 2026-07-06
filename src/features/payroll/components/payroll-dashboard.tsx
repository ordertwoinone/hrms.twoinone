"use client";

import Link from "next/link";
import { Clock3, Gift, HandCoins, TrendingUp, Users, Wallet } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { formatCurrency, formatDate } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { AreaChartCard } from "@/components/shared/area-chart-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { PayrollDashboardData } from "../types";
import { RunStatusBadge } from "./payroll-badges";

export function PayrollDashboard({ data }: { data: PayrollDashboardData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="xl:col-span-2">
          <StatCard
            label={`Net payroll · ${data.currentMonthLabel}`}
            value={formatCurrency(data.currentMonthNet, data.currency)}
            icon={Wallet}
          />
        </div>
        <StatCard label="Employees paid" value={data.employeesPaid} icon={Users} />
        <StatCard label="Pending approval" value={data.pendingApprovals} icon={Clock3} />
        <StatCard
          label="Loans outstanding"
          value={formatCurrency(data.activeLoansOutstanding, data.currency)}
          icon={HandCoins}
        />
        <StatCard
          label="Advances outstanding"
          value={formatCurrency(data.activeAdvancesOutstanding, data.currency)}
          icon={TrendingUp}
        />
      </div>

      {data.pendingBonuses > 0 && (
        <Link href={ROUTES.payrollBonuses}>
          <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/5 px-4 py-3 text-sm">
            <Gift className="h-4 w-4 text-warning" />
            <span className="font-medium">
              {data.pendingBonuses} bonus{data.pendingBonuses > 1 ? "es" : ""} pending approval
            </span>
            <span className="ml-auto text-xs text-muted-foreground hover:underline">Review →</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AreaChartCard title="Net payroll by month" data={data.byMonthNet} />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent runs</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.payrollRuns}>View all</Link>
            </Button>
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
                      href={`${ROUTES.payrollRuns}/${r.id}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium hover:underline">
                          {r.periodLabel}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.employeeCount} employees · {formatDate(r.createdAt)}
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(
          [
            { href: ROUTES.payrollRuns, label: "Payroll Runs" },
            { href: ROUTES.payrollSalaryStructures, label: "Salary Structures" },
            { href: ROUTES.payrollLoans, label: "Loans" },
            { href: ROUTES.payrollAdvances, label: "Advances" },
          ] as const
        ).map((item) => (
          <Button key={item.href} variant="outline" className="h-16 flex-col gap-1" asChild>
            <Link href={item.href}>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
