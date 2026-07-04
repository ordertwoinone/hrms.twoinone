"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatRelative } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import {
  markAllNotificationsRead,
  markNotificationRead,
  runNotificationScan,
  updateNotificationPreference,
} from "../actions/notifications.actions";
import {
  NOTIFICATION_CATEGORIES,
  SEVERITY_VARIANT,
  categoryLabel,
} from "../constants";
import type { NotificationCenterData, NotificationItem } from "../types";

function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (item: NotificationItem) => void;
}) {
  return (
    <li
      className={cn(
        "flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors",
        !item.readAt && "border-primary/30 bg-primary/5",
      )}
    >
      <button
        type="button"
        onClick={() => onRead(item)}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <span
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full",
            item.readAt ? "bg-muted-foreground/30" : "bg-primary",
          )}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{item.title}</p>
            <Badge variant={SEVERITY_VARIANT[item.type] ?? "outline"}>
              {categoryLabel(item.category)}
            </Badge>
          </div>
          {item.body ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
          ) : null}
          <p className="mt-0.5 text-[11px] text-subtle-foreground">
            {formatRelative(item.createdAt)}
          </p>
        </div>
      </button>
    </li>
  );
}

export function NotificationCenter({
  data,
  canManage,
}: {
  data: NotificationCenterData;
  canManage: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [category, setCategory] = React.useState("all");
  const [scanning, setScanning] = React.useState(false);

  const items = data.items.filter((n) => {
    if (filter === "unread" && n.readAt) return false;
    if (category !== "all" && n.category !== category) return false;
    return true;
  });

  async function openItem(item: NotificationItem) {
    if (!item.readAt) await markNotificationRead(item.id);
    if (item.link) router.push(item.link);
    else router.refresh();
  }

  async function onMarkAll() {
    const result = await markAllNotificationsRead();
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("All notifications marked read.");
    router.refresh();
  }

  async function onScan() {
    setScanning(true);
    const result = await runNotificationScan();
    setScanning(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(
      result.data.created > 0
        ? `Created ${result.data.created} notification(s).`
        : "No new notifications — everything is up to date.",
    );
    router.refresh();
  }

  async function togglePref(
    cat: string,
    channel: "in_app" | "email",
    enabled: boolean,
  ) {
    const result = await updateNotificationPreference(cat, channel, enabled);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Tabs defaultValue="inbox" className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          <TabsTrigger value="inbox">
            Inbox
            {data.unreadCount > 0 ? (
              <Badge variant="solid" className="ml-1.5 px-1.5">
                {data.unreadCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        {canManage ? (
          <Button variant="outline" size="sm" onClick={onScan} disabled={scanning}>
            {scanning ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Run scan
          </Button>
        ) : null}
      </div>

      <TabsContent value="inbox" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as "all" | "unread")}
            >
              <SelectTrigger className="h-9 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {NOTIFICATION_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {data.unreadCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={onMarkAll}>
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={filter === "unread" ? BellOff : Bell}
            title={filter === "unread" ? "No unread notifications" : "No notifications"}
            description="New notifications will appear here."
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <NotificationRow key={item.id} item={item} onRead={openItem} />
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="preferences">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hidden grid-cols-[1fr_5rem_5rem] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground sm:grid">
              <span>Category</span>
              <span className="text-center">In-app</span>
              <span className="text-center">Email</span>
            </div>
            <ul className="divide-y">
              {data.preferences.map((p) => (
                <li
                  key={p.category}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 py-3 sm:grid-cols-[1fr_5rem_5rem]"
                >
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-6 sm:contents">
                    <div className="flex items-center gap-1.5 sm:justify-center">
                      <Checkbox
                        checked={p.inApp}
                        onCheckedChange={(v) =>
                          togglePref(p.category, "in_app", v === true)
                        }
                        aria-label={`${p.label} in-app`}
                      />
                      <span className="text-xs text-muted-foreground sm:hidden">
                        In-app
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:justify-center">
                      <Checkbox
                        checked={p.email}
                        onCheckedChange={(v) =>
                          togglePref(p.category, "email", v === true)
                        }
                        aria-label={`${p.label} email`}
                      />
                      <span className="text-xs text-muted-foreground sm:hidden">
                        Email
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Email delivery is queued to your address when enabled. In-app
              notifications always appear in this center and the header bell.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
