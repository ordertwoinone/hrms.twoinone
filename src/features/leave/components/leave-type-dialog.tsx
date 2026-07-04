"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge, type BadgeProps } from "@/components/ui/badge";
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
import { createLeaveType, updateLeaveType } from "../actions/leave.actions";
import {
  leaveTypeFormSchema,
  type LeaveTypeFormInput,
} from "../schemas/leave.schema";
import { LEAVE_COLOR_VARIANTS } from "../constants";
import type { LeaveType } from "../types";

const NONE = "__none__";

const EMPTY: LeaveTypeFormInput = {
  name: "",
  code: "",
  description: "",
  days_per_year: 0,
  is_paid: true,
  requires_attachment: false,
  gender_restriction: "",
  color: "primary",
  status: "active",
};

export function LeaveTypeDialog({
  open,
  onOpenChange,
  leaveType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType?: LeaveType | null;
}) {
  const router = useRouter();
  const isEdit = !!leaveType;

  const form = useForm<LeaveTypeFormInput>({
    resolver: zodResolver(leaveTypeFormSchema),
    defaultValues: EMPTY,
    values: leaveType
      ? {
          name: leaveType.name,
          code: leaveType.code,
          description: leaveType.description ?? "",
          days_per_year: leaveType.days_per_year,
          is_paid: leaveType.is_paid,
          requires_attachment: leaveType.requires_attachment,
          gender_restriction:
            (leaveType.gender_restriction ??
              "") as LeaveTypeFormInput["gender_restriction"],
          color: leaveType.color as LeaveTypeFormInput["color"],
          status: leaveType.status as LeaveTypeFormInput["status"],
        }
      : undefined,
  });

  async function onSubmit(values: LeaveTypeFormInput) {
    const result = isEdit
      ? await updateLeaveType({ id: leaveType!.id, ...values })
      : await createLeaveType(values);
    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof LeaveTypeFormInput, {
            message: messages?.[0],
          });
        }
      }
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Leave type updated." : "Leave type created.");
    if (!isEdit) form.reset(EMPTY);
    onOpenChange(false);
    router.refresh();
  }

  const isSystem = leaveType?.is_system ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit leave type" : "Add leave type"}
          </DialogTitle>
          <DialogDescription>
            {isSystem
              ? "This is a system leave type — some fields are protected."
              : "Configure how this leave type behaves for requests and balances."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="leave-type-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. ANNUAL"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="days_per_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days / year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={366}
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LEAVE_COLOR_VARIANTS.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="flex items-center gap-2">
                              <Badge variant={c as BadgeProps["variant"]}>
                                {c}
                              </Badge>
                            </span>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender_restriction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender restriction (optional)</FormLabel>
                  <Select
                    value={field.value ? field.value : NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>No restriction</SelectItem>
                      <SelectItem value="male">Male only</SelectItem>
                      <SelectItem value="female">Female only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="is_paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-lg border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Paid leave</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requires_attachment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-lg border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Requires attachment
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
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
            form="leave-type-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create leave type"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
