"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchLeaveCalendarAction } from "../actions/leave.actions";
import type { LeaveCalendarEntry } from "../types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function asVariant(color: string): BadgeProps["variant"] {
  const allowed = [
    "default",
    "primary",
    "success",
    "warning",
    "destructive",
    "outline",
    "solid",
  ];
  return (allowed.includes(color) ? color : "default") as BadgeProps["variant"];
}

export function LeaveCalendar({
  initialYear,
  initialMonth,
  initialLeaves,
  initialHolidays,
}: {
  initialYear: number;
  initialMonth: number;
  initialLeaves: LeaveCalendarEntry[];
  initialHolidays: { date: string; name: string }[];
}) {
  const [year, setYear] = React.useState(initialYear);
  const [month, setMonth] = React.useState(initialMonth); // 1-12
  const [leaves, setLeaves] = React.useState(initialLeaves);
  const [holidays, setHolidays] = React.useState(initialHolidays);
  const [loading, setLoading] = React.useState(false);

  async function go(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setLoading(true);
    const result = await fetchLeaveCalendarAction(y, m);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setYear(y);
    setMonth(m);
    setLeaves(result.data.leaves);
    setHolidays(result.data.holidays);
  }

  const holidayByDate = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const h of holidays) map.set(h.date, h.name);
    return map;
  }, [holidays]);

  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {MONTHS[month - 1]} {year}
          </h3>
          <div className="flex items-center gap-1">
            {loading ? (
              <Loader2 className="mr-1 size-4 animate-spin text-muted-foreground" />
            ) : null}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => go(-1)}
              disabled={loading}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => go(1)}
              disabled={loading}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="bg-muted/50 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {cells.map((day, index) => {
            if (day === null) {
              return <div key={index} className="min-h-24 bg-card" />;
            }
            const dayISO = iso(year, month, day);
            const holidayName = holidayByDate.get(dayISO);
            const dayLeaves = leaves.filter(
              (l) => dayISO >= l.startDate && dayISO <= l.endDate,
            );
            const isToday = dayISO === todayISO;
            return (
              <div
                key={index}
                className={cn(
                  "min-h-24 space-y-1 bg-card p-1.5",
                  holidayName && "bg-destructive/5",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs",
                      isToday
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {day}
                  </span>
                </div>
                {holidayName ? (
                  <p className="truncate text-[10px] font-medium text-destructive">
                    {holidayName}
                  </p>
                ) : null}
                {dayLeaves.slice(0, 3).map((l) => (
                  <Badge
                    key={l.id}
                    variant={asVariant(l.leaveTypeColor)}
                    className="flex w-full truncate"
                    title={`${l.employeeName} · ${l.leaveTypeName}`}
                  >
                    <span className="truncate">{l.employeeName}</span>
                  </Badge>
                ))}
                {dayLeaves.length > 3 ? (
                  <p className="text-[10px] text-muted-foreground">
                    +{dayLeaves.length - 3} more
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
