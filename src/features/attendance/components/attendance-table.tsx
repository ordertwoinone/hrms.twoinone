"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

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
import { CalendarClock } from "lucide-react";
import type { AttendanceListItem } from "../types";
import { STATUS_BADGE, fmtTime, fmtDuration } from "../constants";

const col = createColumnHelper<AttendanceListItem>();

interface Props {
  rows: AttendanceListItem[];
}

export function AttendanceTable({ rows }: Props) {
  const columns = useMemo(
    () => [
      col.accessor("attendanceDate", {
        header: "Date",
        cell: (info) => {
          const d = new Date(info.getValue() + "T00:00:00");
          return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        },
      }),
      col.accessor("employeeName", {
        header: "Employee",
        cell: (info) => (
          <div>
            <p className="font-medium">{info.getValue()}</p>
            <p className="text-xs text-muted-foreground">{info.row.original.employeeCode}</p>
          </div>
        ),
      }),
      col.accessor("department", { header: "Department" }),
      col.accessor("status", {
        header: "Status",
        cell: (info) => {
          const meta = STATUS_BADGE[info.getValue()];
          return <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? info.getValue()}</Badge>;
        },
      }),
      col.accessor("checkIn", {
        header: "Check In",
        cell: (info) => fmtTime(info.getValue()),
      }),
      col.accessor("checkOut", {
        header: "Check Out",
        cell: (info) => fmtTime(info.getValue()),
      }),
      col.accessor("workMinutes", {
        header: "Work Time",
        cell: (info) => fmtDuration(info.getValue()),
      }),
      col.accessor("lateMinutes", {
        header: "Late",
        cell: (info) => info.getValue() > 0 ? (
          <span className="text-amber-600 font-medium">{fmtDuration(info.getValue())}</span>
        ) : "—",
      }),
      col.accessor("overtimeMinutes", {
        header: "OT",
        cell: (info) => info.getValue() > 0 ? (
          <span className="text-teal-600 font-medium">{fmtDuration(info.getValue())}</span>
        ) : "—",
      }),
      col.accessor("shiftName", {
        header: "Shift",
        cell: (info) => info.getValue() ?? "—",
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No records"
        description="No attendance records for the selected period."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
