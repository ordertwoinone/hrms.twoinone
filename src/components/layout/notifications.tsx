"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Notifications bell with an unread-count badge and a popover panel.
 * STRUCTURE ONLY — the list is a placeholder until the notifications module is
 * built; the unread count would come from a query/subscription.
 */
export function Notifications({ unread = 0 }: { unread?: number }) {
  return (
    <Popover>
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
          <button className="text-xs font-medium text-primary hover:underline">
            Mark all read
          </button>
        </div>
        <div className="p-2">
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="New notifications will appear here."
            className="border-0 py-8"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
