import { History } from "lucide-react";

import { formatDateTime, formatRelative } from "@/utils";
import { EmptyState } from "@/components/shared/empty-state";
import type { AuditLogRow } from "../../types";
import { SectionCard } from "../section-card";

function describe(log: AuditLogRow): string {
  const section =
    (log.metadata as { section?: string } | null)?.section ?? "record";
  const action =
    log.action === "create"
      ? "added"
      : log.action === "delete"
        ? "removed"
        : "updated";
  return `${section.replace(/_/g, " ")} ${action}`;
}

/** Read-only activity timeline built from the employee's audit-log entries. */
export function ActivitySection({ activity }: { activity: AuditLogRow[] }) {
  return (
    <SectionCard
      title="Activity timeline"
      description="Recent changes to this employee’s record."
    >
      {activity.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity yet"
          description="Changes will appear here."
          className="border-0"
        />
      ) : (
        <ol className="relative space-y-5 border-l pl-5">
          {activity.map((log) => (
            <li key={log.id} className="relative">
              <span className="absolute -left-[1.45rem] top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium capitalize">
                  {describe(log)}
                </p>
                <time className="shrink-0 text-xs text-subtle-foreground">
                  {formatRelative(log.created_at)}
                </time>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(log.created_at)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
