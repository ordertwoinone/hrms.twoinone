"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayPickerProps,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * Calendar built on react-day-picker v10. Styled to the design system and used
 * by the DatePicker. Pass through any DayPicker props (mode, selected, etc.).
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: cn(defaults.months, "flex flex-col gap-4 sm:flex-row"),
        month: cn(defaults.month, "space-y-4"),
        month_caption: cn(
          defaults.month_caption,
          "relative flex h-9 items-center justify-center",
        ),
        caption_label: cn(defaults.caption_label, "text-sm font-medium"),
        nav: cn(defaults.nav, "flex items-center gap-1"),
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "absolute left-1 top-0 z-10 opacity-70 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "absolute right-1 top-0 z-10 opacity-70 hover:opacity-100",
        ),
        month_grid: cn(defaults.month_grid, "w-full border-collapse"),
        weekdays: cn(defaults.weekdays, "flex"),
        weekday: cn(
          defaults.weekday,
          "w-9 rounded-md text-xs font-normal text-muted-foreground",
        ),
        week: cn(defaults.week, "mt-1 flex w-full"),
        day: cn(
          defaults.day,
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-9 p-0 font-normal aria-selected:opacity-100",
        ),
        today: cn(defaults.today, "font-semibold text-primary"),
        selected: cn(
          defaults.selected,
          "[&>button:hover]:bg-primary-hover [&>button]:bg-primary [&>button]:text-primary-foreground",
        ),
        outside: cn(defaults.outside, "text-muted-foreground/50"),
        disabled: cn(defaults.disabled, "text-muted-foreground/40 opacity-50"),
        range_middle: cn(
          defaults.range_middle,
          "rounded-none [&>button]:bg-accent [&>button]:text-accent-foreground",
        ),
        hidden: cn(defaults.hidden, "invisible"),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className={cn("h-4 w-4", chevronClassName)} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";
