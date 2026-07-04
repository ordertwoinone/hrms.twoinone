"use client";

import { Monitor, Wifi, User, Clock, Tag, Hash } from "lucide-react";

import { formatDateTime } from "@/utils";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { actionMeta, entityLabel } from "../constants";
import type { AuditLogItem } from "../types";

interface AuditDetailDrawerProps {
  item: AuditLogItem | null;
  onClose: () => void;
}

function JsonBlock({ value, label }: { value: unknown; label: string }) {
  if (value == null) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-auto max-h-48 whitespace-pre-wrap break-all font-mono leading-relaxed">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/40">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm">{value}</div>
      </div>
    </div>
  );
}

export function AuditDetailDrawer({ item, onClose }: AuditDetailDrawerProps) {
  if (!item) return null;
  const meta = actionMeta(item.action);

  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            <span className="text-base font-medium">
              {entityLabel(item.entity)}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <DetailRow
              icon={Clock}
              label="Timestamp"
              value={formatDateTime(item.createdAt)}
            />
            <DetailRow
              icon={User}
              label="Actor"
              value={
                <span>
                  {item.actorName}
                  {item.actorId && (
                    <span className="ml-1.5 text-xs text-muted-foreground font-mono">
                      ({item.actorId.slice(0, 8)}…)
                    </span>
                  )}
                </span>
              }
            />
            <DetailRow
              icon={Tag}
              label="Entity"
              value={entityLabel(item.entity)}
            />
            {item.entityId && (
              <DetailRow
                icon={Hash}
                label="Entity ID"
                value={
                  <span className="font-mono text-xs">{item.entityId}</span>
                }
              />
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Client context
            </p>
            {item.ip && (
              <DetailRow
                icon={Wifi}
                label="IP Address"
                value={<span className="font-mono text-xs">{item.ip}</span>}
              />
            )}
            {item.device && (
              <DetailRow
                icon={Monitor}
                label="Device / OS"
                value={item.device}
              />
            )}
            {item.browser && (
              <DetailRow
                icon={Monitor}
                label="Browser"
                value={item.browser}
              />
            )}
            {item.userAgent && (
              <div className="rounded-md border bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground font-mono break-all leading-relaxed">
                  {item.userAgent}
                </p>
              </div>
            )}
            {!item.ip && !item.device && !item.browser && (
              <p className="text-sm text-muted-foreground">
                No client context captured.
              </p>
            )}
          </div>

          {(item.before != null || item.after != null) && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Change snapshot
                </p>
                <JsonBlock value={item.before} label="Before" />
                <JsonBlock value={item.after} label="After" />
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
