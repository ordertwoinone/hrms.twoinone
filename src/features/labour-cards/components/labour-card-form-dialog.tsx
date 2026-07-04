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
  createLabourCardAction,
  updateLabourCardAction,
} from "../actions/labour-card.actions";
import {
  labourCardFormSchema,
  type LabourCardFormInput,
} from "../schemas/labour-card.schema";
import { LABOUR_CARD_STATUSES } from "../constants";
import type { LabourCardFormOptions, LabourCardListItem } from "../types";

const EMPTY: LabourCardFormInput = {
  employee_id: "",
  card_number: "",
  issue_date: "",
  expiry_date: "",
  renewal_date: "",
  status: "active",
  notes: "",
};

export function LabourCardFormDialog({
  open,
  onOpenChange,
  options,
  record,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: LabourCardFormOptions;
  record?: LabourCardListItem | null;
}) {
  const router = useRouter();
  const isEdit = !!record;
  const [file, setFile] = React.useState<File | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<LabourCardFormInput>({
    resolver: zodResolver(labourCardFormSchema),
    defaultValues: EMPTY,
    values: record
      ? {
          employee_id: record.employeeId,
          card_number: record.cardNumber,
          issue_date: record.issueDate,
          expiry_date: record.expiryDate,
          renewal_date: record.renewalDate ?? "",
          status: record.status,
          notes: record.notes ?? "",
        }
      : undefined,
  });

  function reset() {
    form.reset(EMPTY);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(values: LabourCardFormInput) {
    const fd = new FormData();
    if (isEdit) fd.set("id", record!.id);
    fd.set("employee_id", values.employee_id);
    fd.set("card_number", values.card_number);
    fd.set("issue_date", values.issue_date);
    fd.set("expiry_date", values.expiry_date);
    if (values.renewal_date) fd.set("renewal_date", values.renewal_date);
    fd.set("status", values.status);
    if (values.notes) fd.set("notes", values.notes);
    if (file) fd.set("file", file);

    const result = isEdit
      ? await updateLabourCardAction(fd)
      : await createLabourCardAction(fd);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Labour card updated." : "Labour card added.");
    if (!isEdit) reset();
    onOpenChange(false);
    router.refresh();
  }

  const text = (
    name: keyof LabourCardFormInput,
    label: string,
    type = "text",
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isEdit) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit labour card" : "Add labour card"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this labour card record and its document."
              : "Register a labour card against an employee."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="labour-card-form"
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
                          {e.code ? (
                            <span className="text-muted-foreground">
                              {" "}
                              · {e.code}
                            </span>
                          ) : null}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {text("card_number", "Labour card number")}
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
                        {LABOUR_CARD_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {text("issue_date", "Issue date", "date")}
              {text("expiry_date", "Expiry date", "date")}
              {text("renewal_date", "Renewal date", "date")}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>
                Document{" "}
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
              ) : isEdit && record?.attachmentName ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="size-3" />
                  Current: {record.attachmentName} (upload to replace)
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
            form="labour-card-form"
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
              "Add labour card"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
