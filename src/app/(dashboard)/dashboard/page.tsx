import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  UserCheck,
  CalendarDays,
  ShieldAlert,
  Cake,
  Megaphone,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AreaChartCard } from "@/components/shared/area-chart-card";
import { getInitials } from "@/utils/format";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Dashboard — STRUCTURE ONLY. Demonstrates the premium 12-column dashboard
 * layout with the full widget set (stats, trend chart, visa expiry, attendance,
 * leave, birthdays, announcements). All figures are placeholder/mock data until
 * the modules are built.
 */
const stats = [
  { label: "Total Employees", value: 248, icon: Users, delta: 3.2 },
  { label: "Present Today", value: 231, icon: UserCheck, delta: 1.1 },
  { label: "On Leave", value: 12, icon: CalendarDays, delta: -2.4 },
  { label: "Visa Expiring", value: 5, icon: ShieldAlert, delta: 0.8 },
] as const;

const headcount = [
  { label: "Jul", value: 212 },
  { label: "Aug", value: 218 },
  { label: "Sep", value: 223 },
  { label: "Oct", value: 229 },
  { label: "Nov", value: 234 },
  { label: "Dec", value: 238 },
  { label: "Jan", value: 241 },
  { label: "Feb", value: 244 },
  { label: "Mar", value: 246 },
  { label: "Apr", value: 247 },
  { label: "May", value: 248 },
  { label: "Jun", value: 248 },
];

const visaExpiry = [
  { name: "Aisha Rahman", role: "Sales Executive", days: 8 },
  { name: "Mohammed Ali", role: "Warehouse Lead", days: 14 },
  { name: "Priya Nair", role: "Accountant", days: 21 },
  { name: "James Carter", role: "Driver", days: 27 },
];

const onLeave = [
  { name: "Sara Khan", type: "Annual", until: "Jun 30" },
  { name: "David Lee", type: "Sick", until: "Jun 27" },
  { name: "Fatima Noor", type: "Annual", until: "Jul 04" },
];

const birthdays = [
  { name: "Omar Yusuf", date: "Today" },
  { name: "Lena Park", date: "Jun 28" },
  { name: "Raj Patel", date: "Jun 30" },
];

const announcements = [
  {
    title: "Eid Al Adha holidays",
    body: "Offices closed Jun 16–18. WPS payroll will run a day early.",
    date: "2 days ago",
  },
  {
    title: "New health insurance provider",
    body: "Cards for the updated plan are being distributed by HR this week.",
    date: "5 days ago",
  },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const firstName = user?.fullName.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here’s what’s happening across your organization today."
      />

      <div className="grid grid-cols-12 gap-4">
        {/* KPI row */}
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            delta={stat.delta}
            className="col-span-12 sm:col-span-6 xl:col-span-3"
          />
        ))}

        {/* Trend + attendance */}
        <div className="col-span-12 lg:col-span-8">
          <AreaChartCard title="Headcount trend" data={headcount} />
        </div>
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Today’s attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Present", value: 231, tone: "bg-success" },
              { label: "Late", value: 6, tone: "bg-warning" },
              { label: "Absent", value: 11, tone: "bg-destructive" },
            ].map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${row.tone}`}
                    style={{ width: `${(row.value / 248) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Visa expiry */}
        <WidgetCard
          className="col-span-12 lg:col-span-4"
          title="Upcoming visa expiry"
          icon={ShieldAlert}
          href="/employees"
        >
          {visaExpiry.map((item) => (
            <ListRow
              key={item.name}
              name={item.name}
              meta={item.role}
              trailing={
                <Badge variant={item.days <= 14 ? "warning" : "outline"}>
                  {item.days}d
                </Badge>
              }
            />
          ))}
        </WidgetCard>

        {/* On leave */}
        <WidgetCard
          className="col-span-12 lg:col-span-4"
          title="Employees on leave"
          icon={CalendarDays}
          href="/leave"
        >
          {onLeave.map((item) => (
            <ListRow
              key={item.name}
              name={item.name}
              meta={`${item.type} · until ${item.until}`}
              trailing={<Badge variant="primary">{item.type}</Badge>}
            />
          ))}
        </WidgetCard>

        {/* Birthdays */}
        <WidgetCard
          className="col-span-12 lg:col-span-4"
          title="Birthdays"
          icon={Cake}
        >
          {birthdays.map((item) => (
            <ListRow
              key={item.name}
              name={item.name}
              meta={item.date}
              trailing={
                item.date === "Today" ? (
                  <Badge variant="success">Today</Badge>
                ) : null
              }
            />
          ))}
        </WidgetCard>

        {/* Announcements */}
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="size-[18px] text-muted-foreground" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {announcements.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span className="shrink-0 text-xs text-subtle-foreground">
                    {item.date}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Sara K. requested annual leave",
              "Payroll for May was processed",
              "Omar Y. updated their profile",
              "New employee onboarded",
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                <p className="text-sm text-muted-foreground">{activity}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Small dashboard widget card with an optional "view all" link. */
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

/** A single person row used across dashboard widgets. */
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
