import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Percent change vs. previous period; sign drives the color/arrow. */
  delta?: number;
  /** Context label for the delta, e.g. "vs last month". */
  deltaLabel?: string;
  className?: string;
}

/**
 * Compact KPI card for the dashboard. Calm by design: a muted label, a clear
 * value, and an optional trend indicator. No oversized numbers or color blocks.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel = "vs last month",
  className,
}: StatCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-[18px]" />
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {delta !== undefined ? (
          <div className="flex flex-col items-end">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                isPositive ? "text-success" : "text-destructive",
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {Math.abs(delta)}%
            </span>
            <span className="text-[11px] text-subtle-foreground">
              {deltaLabel}
            </span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
