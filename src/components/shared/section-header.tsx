import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned actions (e.g. a "View all" link or filter). */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Lightweight header for a section within a page (e.g. above a card group or a
 * table). Smaller than `PageHeader`; used for sub-sections.
 */
export function SectionHeader({
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
