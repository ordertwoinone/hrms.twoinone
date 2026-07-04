"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelative } from "@/utils";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/actions/notifications.actions";
import type { NotificationItem } from "@/features/notifications/types";

/**
 * Header notifications bell: unread-count badge and a popover of recent
 * notifications, backed by the Notification Center. Data is fetched server-side
 * in the header and passed in.
 */
export function Notifications({
  items = [],
  unread = 0,
}: {
  items?: NotificationItem[];
  unread?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  async function openItem(item: NotificationItem) {
    setOpen(false);
    if (!item.readAt) await markNotificationRead(item.id);
    if (item.link) router.push(item.link);
    else router.refresh();
  }

  async function markAll() {
    await markAllNotificationsRead();
    router.refresh();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        >
          <Bell className="text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 ? (
            <button
              type="button"
              onClick={markAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        {items.length === 0 ? (
          <div className="p-2">
            <EmptyState
              icon={Bell}
              title="You’re all caught up"
              description="New notifications will appear here."
              className="border-0 py-8"
            />
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <ul className="p-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left hover:bg-accent",
                      !item.readAt && "bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        item.readAt ? "bg-muted-foreground/30" : "bg-primary",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {item.title}
                      </span>
                      {item.body ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.body}
                        </span>
                      ) : null}
                      <span className="block text-[11px] text-subtle-foreground">
                        {formatRelative(item.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <Link href={ROUTES.notifications} onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
