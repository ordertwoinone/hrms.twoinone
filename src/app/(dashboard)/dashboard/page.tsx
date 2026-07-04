import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  ShieldAlert,
  Cake,
  ChevronRight,
  UserPlus,
  UserMinus,
  Wallet,
  BookUser,
  Fingerprint,
  SquareUser,
  ShieldPlus,
  FileSignature,
  Zap,
  ScrollText,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AreaChartCard } from "@/components/shared/area-chart-card";
import { getInitials, formatCurrency } from "@/utils/format";
import { formatDate, formatRelative } from "@/utils/date";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardData } from "@/features/dashboard/queries/dashboard.queries";
import { DonutChartCard } from "@/features/dashboard/components/donut-chart-card";
import { HBarChartCard } from "@/features/dashboard/components/hbar-chart-card";
import { entityLabel } from "@/features/audit/constants";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Dashboard",
};

const ENTITY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  visa: ShieldAlert,
  passport: BookUser,
  emirates_id: Fingerprint,
  labour_card: SquareUser,
  insurance: ShieldPlus,
  contract: FileSignature,
};

const QUICK_ACTIONS = [
  { label: "Add Employee", href: ROUTES.employees, icon: UserPlus },
  { label: "New Leave Request", href: ROUTES.leave, icon: CalendarDays },
  { label: "Run Payroll", href: ROUTES.payroll, icon: Wallet },
  { label: "View Reports", href: ROUTES.reports, icon: ScrollText },
  { label: "New Contract", href: ROUTES.contracts, icon: FileSignature },
  { label: "Audit Log", href: ROUTES.audit, icon: Zap },
];

export default async function DashboardPage() {
  const [user, data] = await Promise.all([getCurrentUser(), getDashboardData()]);
  const firstName = user?.fullName.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description="Here's what's happening across your organization today."
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* ── Row 1: KPI stats ───────────────────────────────────────── */}
        <StatCard
          label="Total Employees"
          value={data.totalEmployees}
          icon={Users}
          className="col-span-12 sm:col-span-6 xl:col-span-3"
        />
        <StatCard
          label="On Leave Today"
          value={data.onLeaveToday}
          icon={CalendarDays}
          className="col-span-12 sm:col-span-6 xl:col-span-3"
        />
        <StatCard
          label="New Joiners (this month)"
          value={data.newJoinersThisMonth}
          icon={UserPlus}
          className="col-span-12 sm:col-span-6 xl:col-span-3"
        />
        <StatCard
          label="Resigned (this month)"
          value={data.resignedThisMonth}
          icon={UserMinus}
          className="col-span-12 sm:col-span-6 xl:col-span-3"
        />

        {/* ── Row 2: Expiry counters ─────────────────────────────────── */}
        <StatCard
          label="Visas Expiring (30d)"
          value={data.visaExpiring30d}
          icon={ShieldAlert}
          className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2"
        />
        <StatCard
          label="Passports Expiring (30d)"
          value={data.passportExpiring30d}
          icon={BookUser}
          className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2"
        />
        <StatCard
          label="Emirates IDs (30d)"
          value={data.emiratesIdExpiring30d}
          icon={Fingerprint}
          className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2"
        />
        <StatCard
          label="Labour Cards (30d)"
          value={data.labourCardExpiring30d}
          icon={SquareUser}
          className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2"
        />
        <StatCard
          label="Insurance Expiring (30d)"
          value={data.insuranceExpiring30d}
          icon={ShieldPlus}
          className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2"
        />
        <StatCard
          label="Contracts Expiring (30d)"
          value={data.contractsExpiring30d}
          icon={FileSignature}
          className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2"
        />

        {/* ── Row 3: Headcount trend + Gender donut ─────────────────── */}
        <div className="col-span-12 lg:col-span-8">
          <AreaChartCard title="New joiners — last 6 months" data={data.headcountTrend} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          {data.genderDistribution.length > 0 ? (
            <DonutChartCard title="Gender distribution" data={data.genderDistribution} />
          ) : (
            <Card className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No gender data</p>
            </Card>
          )}
        </div>

        {/* ── Row 4: Department + Nationality ───────────────────────── */}
        <div className="col-span-12 lg:col-span-6">
          {data.departmentDistribution.length > 0 ? (
            <HBarChartCard title="Employees by department" data={data.departmentDistribution} />
          ) : (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">No department data</p>
            </Card>
          )}
        </div>
        <div className="col-span-12 lg:col-span-6">
          {data.nationalityDistribution.length > 0 ? (
            <HBarChartCard title="Nationality distribution" data={data.nationalityDistribution} />
          ) : (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">No nationality data</p>
            </Card>
          )}
        </div>

        {/* ── Row 5: Expiry alerts + On leave ───────────────────────── */}
        <WidgetCard
          className="col-span-12 lg:col-span-6"
          title="Upcoming expiry alerts"
          icon={ShieldAlert}
          href={ROUTES.visas}
        >
          {data.expiryAlerts.length > 0 ? (
            data.expiryAlerts.map((a, i) => {
              const Icon = ENTITY_ICON[a.entity] ?? ShieldAlert;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {a.entity.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Badge variant={a.daysUntil <= 7 ? "destructive" : a.daysUntil <= 14 ? "warning" : "outline"}>
                    {a.daysUntil}d
                  </Badge>
                </div>
              );
            })
          ) : (
            <p className="py-4 text-sm text-muted-foreground text-center">
              No expiries in the next 30 days.
            </p>
          )}
        </WidgetCard>

        <WidgetCard
          className="col-span-12 lg:col-span-6"
          title="Employees on leave"
          icon={CalendarDays}
          href={ROUTES.leave}
        >
          {data.currentLeave.length > 0 ? (
            data.currentLeave.map((item, i) => (
              <ListRow
                key={i}
                name={item.employeeName}
                meta={`Until ${formatDate(item.endDate)}`}
                trailing={<Badge variant="primary">{item.leaveTypeName}</Badge>}
              />
            ))
          ) : (
            <p className="py-4 text-sm text-muted-foreground text-center">
              No one is currently on leave.
            </p>
          )}
        </WidgetCard>

        {/* ── Row 6: Recent activity + Birthdays ────────────────────── */}
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <ScrollText className="size-[18px] text-muted-foreground" />
              Recent activity
            </CardTitle>
            <Link
              href={ROUTES.audit}
              className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
            >
              View audit log
              <ChevronRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="divide-y">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{a.actorName}</span>
                      {" "}
                      <span className="text-muted-foreground">{a.action}d</span>
                      {" "}
                      <span className="text-muted-foreground">{entityLabel(a.entity)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(a.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Birthdays widget */}
          <WidgetCard title="Upcoming birthdays" icon={Cake}>
            {data.upcomingBirthdays.length > 0 ? (
              data.upcomingBirthdays.map((b, i) => (
                <ListRow
                  key={i}
                  name={b.name}
                  meta={
                    b.daysUntil === 0
                      ? "Today 🎂"
                      : b.daysUntil === 1
                        ? "Tomorrow"
                        : `In ${b.daysUntil} days`
                  }
                  trailing={
                    b.daysUntil === 0 ? <Badge variant="success">Today</Badge> : null
                  }
                />
              ))
            ) : (
              <p className="py-4 text-sm text-muted-foreground text-center">
                No upcoming birthdays.
              </p>
            )}
          </WidgetCard>

          {/* Payroll summary */}
          {data.lastPayrollNet !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="size-[18px] text-muted-foreground" />
                  Last payroll run
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Period</span>
                  <span className="text-sm font-medium">{data.lastPayrollMonth ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Net payout</span>
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(data.lastPayrollNet)}
                  </span>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={ROUTES.payroll}>
                    View payroll
                    <ChevronRight className="ml-1 size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Row 7: Quick actions ───────────────────────────────────── */}
        <Card className="col-span-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="size-[18px] text-muted-foreground" />
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Button key={action.href} asChild variant="outline" size="sm">
                    <Link href={action.href}>
                      <Icon className="mr-1.5 size-4" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WidgetCard({
  title,
  icon: Icon,
  href,
  className,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-[18px] text-muted-foreground" />
          {title}
        </CardTitle>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
          >
            View all
            <ChevronRight className="size-3.5" />
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="divide-y">{children}</CardContent>
    </Card>
  );
}

function ListRow({
  name,
  meta,
  trailing,
}: {
  name: string;
  meta: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
      <Avatar className="size-8">
        <AvatarFallback className="bg-primary/10 text-xs text-primary">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      {trailing}
    </div>
  );
}
