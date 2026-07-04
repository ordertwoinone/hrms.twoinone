"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
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
import { applyLeaveAction } from "../actions/leave.actions";
import {
  applyLeaveSchema,
  type ApplyLeaveInput,
} from "../schemas/leave.schema";
import { HALF_DAY_PERIODS } from "../constants";
import type { LeaveFormOptions } from "../types";

const EMPTY: ApplyLeaveInput = {
  employee_id: "",
  leave_type_id: "",
  start_date: "",
  end_date: "",
  is_half_day: false,
  half_day_period: "",
  reason: "",
};

export function ApplyLeaveDialog({
  open,
  onOpenChange,
  options,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: LeaveFormOptions;
}) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ApplyLeaveInput>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: EMPTY,
  });

  const isHalfDay = form.watch("is_half_day");
  const leaveTypeId = form.watch("leave_type_id");
  const selectedType = options.leaveTypes.find((t) => t.id === leaveTypeId);

  function reset() {
    form.reset(EMPTY);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(values: ApplyLeaveInput) {
    if (selectedType?.requiresAttachment && !file) {
      toast.error(`${selectedType.name} requires a supporting document.`);
      return;
    }
    const fd = new FormData();
    fd.set("employee_id", values.employee_id);
    fd.set("leave_type_id", values.leave_type_id);
    fd.set("start_date", values.start_date);
    fd.set("end_date", values.is_half_day ? values.start_date : values.end_date);
    fd.set("is_half_day", String(values.is_half_day));
    if (values.is_half_day) {
      fd.set("half_day_period", values.half_day_period || "first");
    }
    if (values.reason) fd.set("reason", values.reason);
    if (file) fd.set("file", file);

    const result = await applyLeaveAction(fd);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Leave request submitted.");
    reset();
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for leave</DialogTitle>
          <DialogDescription>
            Submit a request for approval by the employee’s manager and HR.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="apply-leave-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
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
                      {options.leaveTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedType?.genderRestriction ? (
                    <FormDescription>
                      Available to {selectedType.genderRestriction} employees
                      only.
                    </FormDescription>
                  ) : null}
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
                  <div className="space-y-0.5 leading-none">
                    <FormLabel className="cursor-pointer">Half day</FormLabel>
                    <FormDescription>
                      Counts as 0.5 of a day on a single date.
                    </FormDescription>
                  </div>
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
              {isHalfDay ? (
                <FormField
                  control={form.control}
                  name="half_day_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "first"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HALF_DAY_PERIODS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Add a short note for the approver…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>
                Attachment{" "}
                {selectedType?.requiresAttachment ? (
                  <span className="text-destructive">*</span>
                ) : (
                  <span className="text-muted-foreground">(optional)</span>
                )}
              </FormLabel>
              <div className="flex items-center gap-3">
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                />
              </div>
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
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="apply-leave-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
