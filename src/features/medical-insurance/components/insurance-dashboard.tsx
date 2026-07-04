"use client";

import * as React from "react";
import { AlertTriangle, BellRing, Loader2, ShieldPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatDate } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { sendPolicyRemindersAction } from "../actions/policy.actions";
import { POLICY_STATUSES } from "../constants";
import type { InsuranceDashboardData } from "../types";
import { ExpiryBadge } from "./policy-badges";

function AlertWidget({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "critical" | "warning" | "notice";
}) {
  const styles = {
    critical: "border-destructive/30 bg-destructive/5 text-destructive",
    warning: "border-warning/30 bg-warning/10 text-warning",
    notice: "border-warning/20 bg-warning/5 text-warning",
  }[tone];
  return (
    <Card className={cn("p-5", styles)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <AlertTriangle className="size-4" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {count}
      </p>
      <p className="mt-1 text-xs opacity-80">policies need renewal</p>
    </Card>
  );
}

export function InsuranceDashboard({
  data,
  canManage,
  onViewAll,
}: {
  data: InsuranceDashboardData;
  canManage: boolean;
  onViewAll?: () => void;
}) {
  const [sending, setSending] = React.useState(false);
  const maxProvider = Math.max(1, ...data.byProvider.map((p) => p.value));

  async function onSendReminders() {
    setSending(true);
    const result = await sendPolicyRemindersAction();
    setSending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(
      result.data.count > 0
        ? `Queued ${result.data.count} reminder(s).`
        : "No policies are due for reminders.",
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total policies" value={data.total} icon={ShieldPlus} />
        <StatCard label="Active" value={data.active} icon={ShieldPlus} />
        <StatCard label="Lives covered" value={data.livesCovered} icon={Users} />
        <StatCard label="Expired" value={data.expired} icon={AlertTriangle} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Renewal reminders
          </h3>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendReminders}
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <BellRing className="size-4" />
              )}
              Send reminders
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <AlertWidget label="Within 30 days" count={data.within30} tone="critical" />
          <AlertWidget label="Within 60 days" count={data.within60} tone="warning" />
          <AlertWidget label="Within 90 days" count={data.within90} tone="notice" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Upcoming & overdue</CardTitle>
            {onViewAll ? (
              <button
                type="button"
                onClick={onViewAll}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </button>
            ) : null}
          </CardHeader>
          <CardContent>
            {data.expiringSoon.length === 0 ? (
              <EmptyState
                icon={ShieldPlus}
                title="Nothing expiring soon"
                description="No policies are within the 90-day reminder window."
                className="border-0"
              />
            ) : (
              <ul className="divide-y">
                {data.expiringSoon.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {p.employeeName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.provider} · {p.coverage} · exp{" "}
                        {formatDate(p.expiryDate)}
                      </p>
                    </div>
                    <ExpiryBadge
                      level={p.expiryLevel}
                      daysToExpiry={p.daysToExpiry}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By provider</CardTitle>
            </CardHeader>
            <CardContent>
              {data.byProvider.length === 0 ? (
                <p className="text-sm text-muted-foreground">No policies yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.byProvider.map((p) => (
                    <li key={p.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">{p.name}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {p.value}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(p.value / maxProvider) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">By status</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {POLICY_STATUSES.map((s) => {
                  const found = data.byStatus.find((b) => b.name === s.value);
                  return (
                    <li
                      key={s.value}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{s.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {found?.value ?? 0}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
