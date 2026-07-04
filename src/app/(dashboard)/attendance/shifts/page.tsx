import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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
import { getShifts } from "@/features/attendance/queries/attendance.queries";
import { fmtTime } from "@/features/attendance/constants";

export const metadata: Metadata = { title: "Shifts" };

export default async function ShiftsPage() {
  await requirePermission(PERMISSIONS.ATTENDANCE_VIEW);
  const shifts = await getShifts();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Shift Management"
          description="Define and manage work shifts for employees."
        />
      </div>

      {shifts.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No shifts defined"
          description="No work shifts have been set up yet."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Break</TableHead>
                <TableHead>Grace</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{s.code}</code>
                  </TableCell>
                  <TableCell>{fmtTime(s.startTime)}</TableCell>
                  <TableCell>{fmtTime(s.endTime)}</TableCell>
                  <TableCell>{s.breakMinutes} min</TableCell>
                  <TableCell>{s.graceMinutes} min</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "active" ? "success" : "outline"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
