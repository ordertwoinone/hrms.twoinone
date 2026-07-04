"use client";

import { ChevronRight } from "lucide-react";

import { formatDateTime, formatRelative } from "@/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { actionMeta, entityLabel } from "../constants";
import type { AuditLogItem } from "../types";

interface AuditLogTableProps {
  rows: AuditLogItem[];
  selectedId: string | null;
  onSelect: (item: AuditLogItem) => void;
}

export function AuditLogTable({ rows, selectedId, onSelect }: AuditLogTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No audit logs found"
        description="Try adjusting your filters or date range."
      />
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead className="w-[110px]">Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead className="hidden lg:table-cell">Entity ID</TableHead>
            <TableHead className="hidden xl:table-cell">IP Address</TableHead>
            <TableHead className="hidden xl:table-cell">Device</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const meta = actionMeta(row.action);
            const isSelected = row.id === selectedId;
            return (
              <TableRow
                key={row.id}
                onClick={() => onSelect(row)}
                className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/5 hover:bg-primary/5" : ""}`}
              >
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  <span title={formatDateTime(row.createdAt)}>
                    {formatRelative(row.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-sm">{row.actorName}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={meta.variant} className="text-xs">
                    {meta.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {entityLabel(row.entity)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground max-w-[120px] truncate">
                  {row.entityId ?? "—"}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-xs font-mono text-muted-foreground">
                  {row.ip ?? "—"}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                  {row.device ?? "—"}
                </TableCell>
                <TableCell>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
