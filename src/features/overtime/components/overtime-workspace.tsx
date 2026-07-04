"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Clock, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { approveOvertime, rejectOvertime } from "../actions/overtime.actions";
import type { OvertimeRequestItem, OvertimeSummary } from "../queries/overtime.queries";

interface Props {
  requests: OvertimeRequestItem[];
  summary: OvertimeSummary;
  canApprove: boolean;
}

const STATUS_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "destructive" | "outline" | "solid"> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  cancelled: "outline",
};

export function OvertimeWorkspace({ requests, summary, canApprove }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [pending, start] = useTransition();

  const filtered = requests.filter((r) => statusFilter === "all" || r.status === statusFilter);

  function handleApprove(id: string) {
    start(async () => {
      const res = await approveOvertime(id);
      if (res.success) { toast.success("Approved"); router.refresh(); }
      else toast.error(res.error ?? "Failed");
    });
  }

  function handleReject(id: string) {
    start(async () => {
      const res = await rejectOvertime(id, "Rejected by HR");
      if (res.success) { toast.success("Rejected"); router.refresh(); }
      else toast.error(res.error ?? "Failed");
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Pending" value={summary.pending} icon={Clock} />
        <StatCard label="Approved" value={summary.approved} icon={Check} />
        <StatCard label="Rejected" value={summary.rejected} icon={X} />
        <StatCard label="Approved Hours" value={`${summary.totalHoursApproved}h`} icon={Clock} />
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Clock} title="No overtime requests" description="No overtime requests match the current filter." />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                {canApprove && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{r.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{r.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(r.date + "T00:00:00"), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.startTime.slice(0, 5)} – {r.endTime.slice(0, 5)}
                  </TableCell>
                  <TableCell className="font-medium">{r.hoursRequested}h</TableCell>
                  <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
                    {r.reason ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  {canApprove && (
                    <TableCell>
                      {r.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-teal-600 hover:text-teal-700"
                            onClick={() => handleApprove(r.id)}
                            disabled={pending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive/80"
                            onClick={() => handleReject(r.id)}
                            disabled={pending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
