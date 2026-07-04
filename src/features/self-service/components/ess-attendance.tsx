"use client";

import { CalendarClock } from "lucide-react";

import { formatDate } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMinutes } from "../constants";
import type { EssAttendance } from "../types";

const VARIANT: Record<string, "success" | "warning" | "destructive" | "outline" | "primary"> = {
  present: "success",
  late: "warning",
  half_day: "warning",
  absent: "destructive",
  on_leave: "primary",
  holiday: "outline",
  weekend: "outline",
};

export function EssAttendanceView({ records }: { records: EssAttendance[] }) {
  return (
    <Card>
      <CardContent className="overflow-auto p-0">
        <Table className="[&_td]:py-3">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Worked</TableHead>
              <TableHead className="text-right">Late</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length ? (
              records.map((a, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm font-medium">
                    {formatDate(a.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={VARIANT[a.status] ?? "outline"}>
                      {a.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMinutes(a.workMinutes)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {a.lateMinutes > 0 ? formatMinutes(a.lateMinutes) : "—"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="h-32">
                  <EmptyState
                    icon={CalendarClock}
                    title="No attendance records"
                    description="Your attendance history will appear here."
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
