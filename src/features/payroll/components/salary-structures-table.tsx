"use client";

import * as React from "react";
import { Pencil, Search, Wallet } from "lucide-react";

import { formatCurrency, formatDate } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import type { SalaryStructureItem } from "../types";
import { ReviseSalaryDialog } from "./revise-salary-dialog";

export function SalaryStructuresTable({
  structures,
  canManage,
}: {
  structures: SalaryStructureItem[];
  canManage: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<SalaryStructureItem | null>(
    null,
  );

  const filtered = structures.filter((s) =>
    `${s.employeeName} ${s.employeeCode ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search employee…"
          className="h-9 pl-9"
        />
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <Table className="[&_td]:py-3">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Basic</TableHead>
                <TableHead className="text-right">Housing</TableHead>
                <TableHead className="text-right">Transport</TableHead>
                <TableHead className="text-right">Other</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead>Effective</TableHead>
                {canManage ? <TableHead className="w-10" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? (
                filtered.map((s) => (
                  <TableRow key={s.employeeId}>
                    <TableCell>
                      <p className="text-sm font-medium">{s.employeeName}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {s.employeeCode ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(s.basic, s.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(s.housing, s.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(s.transport, s.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(s.other, s.currency)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(s.gross, s.currency)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.effectiveDate ? formatDate(s.effectiveDate) : "Not set"}
                    </TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Revise salary"
                          onClick={() => setEditing(s)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={canManage ? 8 : 7} className="h-40">
                    <EmptyState
                      icon={Wallet}
                      title="No salary structures"
                      description="Active employees will appear here once added."
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canManage && (
        <ReviseSalaryDialog
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          employee={editing}
        />
      )}
    </div>
  );
}
