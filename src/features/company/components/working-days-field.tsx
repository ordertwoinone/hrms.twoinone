"use client";

import { cn } from "@/lib/utils";
import { WEEKDAYS } from "../constants";

/**
 * Toggle each weekday as a working day. Days left off are treated as the
 * weekend. Controlled via `value` (array of weekday numbers, 0 = Sunday).
 */
export function WorkingDaysField({
  value,
  onChange,
  disabled,
}: {
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
}) {
  function toggle(day: number) {
    const next = value.includes(day)
      ? value.filter((d) => d !== day)
      : [...value, day];
    onChange(next.sort((a, b) => a - b));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {WEEKDAYS.map((day) => {
        const active = value.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => toggle(day.value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {day.short}
          </button>
        );
      })}
    </div>
  );
}
