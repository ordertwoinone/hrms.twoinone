import type { Metadata } from "next";
import { Users, CalendarClock, CalendarDays, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Dashboard landing — STRUCTURE ONLY.
 *
 * Demonstrates the professional dashboard layout (page header + KPI card grid).
 * Real widgets (charts, live counts, activity feed) are added when each module
 * is built. The stat cards below are static placeholders.
 */
const stats = [
  { label: "Total Employees", value: "—", icon: Users },
  { label: "Present Today", value: "—", icon: CalendarClock },
  { label: "On Leave", value: "—", icon: CalendarDays },
  { label: "Payroll (Month)", value: "—", icon: Wallet },
] as const;

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.fullName.split(" ")[0] ?? "there"}`}
        description="Here’s an overview of your organization."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This is the dashboard shell. Modules (Employees, Attendance, Leave,
          Payroll…) plug into the navigation and render here as they’re built.
        </CardContent>
      </Card>
    </div>
  );
}
