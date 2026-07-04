"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  CheckCheck,
  Megaphone,
  Pin,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatRelative } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "../actions/self-service.actions";
import type { SelfServiceData } from "../types";
import { EssProfileView } from "./ess-profile";
import { EssLeave } from "./ess-leave";
import { EssAttendanceView } from "./ess-attendance";
import { EssPayslips } from "./ess-payslips";
import { EssDocuments } from "./ess-documents";
import { EssLetters } from "./ess-letters";

function Announcements({ items }: { items: SelfServiceData["announcements"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="size-4 text-primary" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements"
            description="Company updates will show up here."
            className="border-0"
          />
        ) : (
          <ul className="space-y-4">
            {items.map((a) => (
              <li key={a.id} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  {a.pinned ? (
                    <Pin className="size-3.5 text-primary" />
                  ) : null}
                  <p className="text-sm font-semibold">{a.title}</p>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {a.body}
                </p>
                <p className="mt-1 text-xs text-subtle-foreground">
                  {formatDate(a.publishedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Notifications({
  items,
  onRefresh,
}: {
  items: SelfServiceData["notifications"];
  onRefresh: () => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const hasUnread = items.some((n) => !n.readAt);

  async function readOne(id: string) {
    await markNotificationRead(id);
    onRefresh();
  }
  async function readAll() {
    setBusy(true);
    await markAllNotificationsRead();
    setBusy(false);
    toast.success("All notifications marked read.");
    onRefresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-4 text-primary" />
          Notifications
        </CardTitle>
        {hasUnread ? (
          <Button variant="ghost" size="sm" onClick={readAll} disabled={busy}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="You’re all caught up"
            description="Notifications will appear here."
            className="border-0"
          />
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-lg border p-3",
                  !n.readAt && "border-primary/30 bg-primary/5",
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body ? (
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  ) : null}
                  <p className="mt-0.5 text-[11px] text-subtle-foreground">
                    {formatRelative(n.createdAt)}
                  </p>
                </div>
                {!n.readAt ? (
                  <button
                    type="button"
                    onClick={() => readOne(n.id)}
                    className="shrink-0 text-xs font-medium text-primary hover:underline"
                  >
                    Mark read
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function EssPortal({
  data,
  orgName,
  userName,
}: {
  data: SelfServiceData;
  orgName: string;
  userName: string;
}) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const availableLeave = data.leaveBalances.reduce(
    (sum, b) => sum + b.available,
    0,
  );
  const latestPayslip = data.payslips[0];
  const pendingLetters = data.letters.filter(
    (l) => l.status === "pending" || l.status === "processing",
  ).length;

  if (!data.profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={UserRound}
              title="No employee record linked"
              description="Your login isn’t linked to an employee profile yet. Ask HR to set your work email to match your account, then reload."
            />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Announcements items={data.announcements} />
          <Notifications items={data.notifications} onRefresh={refresh} />
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">
          Overview
          {data.unreadCount > 0 ? (
            <Badge variant="solid" className="ml-1.5 px-1.5">
              {data.unreadCount}
            </Badge>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="leave">Leave</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
        <TabsTrigger value="payslips">Payslips</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="letters">HR letters</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{userName}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Leave available" value={availableLeave} />
          <StatCard
            label={latestPayslip ? `Net · ${latestPayslip.periodLabel}` : "Latest payslip"}
            value={
              latestPayslip
                ? formatCurrency(latestPayslip.net, latestPayslip.currency)
                : "—"
            }
          />
          <StatCard label="Pending letters" value={pendingLetters} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Announcements items={data.announcements} />
          <Notifications items={data.notifications} onRefresh={refresh} />
        </div>
      </TabsContent>

      <TabsContent value="profile">
        <EssProfileView profile={data.profile} />
      </TabsContent>
      <TabsContent value="leave">
        <EssLeave
          balances={data.leaveBalances}
          requests={data.leaveRequests}
          leaveTypes={data.leaveTypes}
        />
      </TabsContent>
      <TabsContent value="attendance">
        <EssAttendanceView records={data.attendance} />
      </TabsContent>
      <TabsContent value="payslips">
        <EssPayslips payslips={data.payslips} orgName={orgName} />
      </TabsContent>
      <TabsContent value="documents">
        <EssDocuments documents={data.documents} />
      </TabsContent>
      <TabsContent value="letters">
        <EssLetters letters={data.letters} />
      </TabsContent>
    </Tabs>
  );
}
