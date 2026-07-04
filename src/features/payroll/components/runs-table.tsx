"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarRange, ChevronRight, Plus } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { formatCurrency, formatDate } from "@/utils";
import { Button } from "@/components/ui/button";
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
import type { PayrollRunListItem } from "../types";
import { RunStatusBadge } from "./payroll-badges";
import { NewRunDialog } from "./new-run-dialog";

export function RunsTable({
  runs,
  canProcess,
}: {
  runs: PayrollRunListItem[];
  canProcess: boolean;
}) {
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {runs.length} payroll run{runs.length === 1 ? "" : "s"}
        </p>
        {canProcess && (
          <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New run
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <Table className="[&_td]:py-3">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Employees</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length ? (
                runs.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`${ROUTES.payroll}/runs/${r.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {r.periodLabel}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <RunStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.employeeCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(r.totalGross, r.currency)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(r.totalNet, r.currency)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(r.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link
                          href={`${ROUTES.payroll}/runs/${r.id}`}
                          aria-label="Open run"
                        >
                          <ChevronRight className="size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="h-40">
                    <EmptyState
                      icon={CalendarRange}
                      title="No payroll runs"
                      description={
                        canProcess
                          ? "Create your first monthly payroll run."
                          : "Runs will appear here once processed."
                      }
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canProcess && (
        <NewRunDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  );
}
