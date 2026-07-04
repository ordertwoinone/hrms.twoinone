"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import type { LeaveBalanceItem } from "@/features/leave/types";
import { applyMyLeave } from "../actions/self-service.actions";
import {
  applyLeaveSelfSchema,
  type ApplyLeaveSelfInput,
} from "../schemas/self-service.schema";
import type { EssLeaveRequest, LeaveTypeOption } from "../types";

const STATUS_VARIANT: Record<string, "warning" | "primary" | "success" | "destructive" | "outline"> = {
  pending: "warning",
  manager_approved: "primary",
  approved: "success",
  rejected: "destructive",
  cancelled: "outline",
};

const EMPTY: ApplyLeaveSelfInput = {
  leave_type_id: "",
  start_date: "",
  end_date: "",
  is_half_day: false,
  half_day_period: "",
  reason: "",
};

export function EssLeave({
  balances,
  requests,
  leaveTypes,
}: {
  balances: LeaveBalanceItem[];
  requests: EssLeaveRequest[];
  leaveTypes: LeaveTypeOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ApplyLeaveSelfInput>({
    resolver: zodResolver(applyLeaveSelfSchema),
    defaultValues: EMPTY,
  });
  const isHalfDay = form.watch("is_half_day");

  async function onSubmit(values: ApplyLeaveSelfInput) {
    const fd = new FormData();
    fd.set("leave_type_id", values.leave_type_id);
    fd.set("start_date", values.start_date);
    fd.set("end_date", values.is_half_day ? values.start_date : values.end_date);
    fd.set("is_half_day", String(values.is_half_day));
    if (values.is_half_day) fd.set("half_day_period", values.half_day_period || "first");
    if (values.reason) fd.set("reason", values.reason);
    if (file) fd.set("file", file);

    const result = await applyMyLeave(fd);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Leave request submitted.");
    form.reset(EMPTY);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Leave balances
        </h3>
        <Button size="sm" onClick={() => setOpen(true)}>
          <CalendarPlus className="size-4" />
          Apply for leave
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {balances.map((b) => (
          <Card key={b.leaveTypeId}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{b.leaveTypeName}</p>
                <Badge variant={b.available > 0 ? "success" : "outline"}>
                  {b.available} left
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-semibold tabular-nums">{b.allocated + b.carriedForward}</p>
                  <p className="text-muted-foreground">Entitled</p>
                </div>
                <div>
                  <p className="font-semibold tabular-nums">{b.used}</p>
                  <p className="text-muted-foreground">Used</p>
                </div>
                <div>
                  <p className="font-semibold tabular-nums text-warning">{b.pending}</p>
                  <p className="text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <Table className="[&_td]:py-3">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length ? (
                requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm font-medium">
                      {r.leaveType}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(r.startDate)}
                      {r.startDate !== r.endDate
                        ? ` → ${formatDate(r.endDate)}`
                        : ""}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.totalDays}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>
                        {r.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="h-32">
                    <EmptyState
                      icon={CalendarPlus}
                      title="No leave requests"
                      description="Apply for leave to see it here."
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for leave</DialogTitle>
            <DialogDescription>
              Your request goes to your manager and HR for approval.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id="ess-leave-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="leave_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leaveTypes.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_half_day"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-lg border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Half day</FormLabel>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isHalfDay ? "Date" : "Start date"}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isHalfDay ? (
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>
                  Attachment{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                />
                {file ? (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="size-3" />
                    {file.name}
                  </p>
                ) : null}
              </FormItem>
            </form>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="ess-leave-form"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : null}
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
