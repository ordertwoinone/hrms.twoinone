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
import { createVisaAction, updateVisaAction } from "../actions/visa.actions";
import { visaFormSchema, type VisaFormInput } from "../schemas/visa.schema";
import { VISA_STATUSES, VISA_TYPES } from "../constants";
import type { VisaFormOptions, VisaListItem } from "../types";

const EMPTY: VisaFormInput = {
  employee_id: "",
  visa_number: "",
  visa_type: "",
  sponsor: "",
  passport_number: "",
  issue_date: "",
  expiry_date: "",
  renewal_date: "",
  status: "active",
  notes: "",
};

export function VisaFormDialog({
  open,
  onOpenChange,
  options,
  visa,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: VisaFormOptions;
  visa?: VisaListItem | null;
}) {
  const router = useRouter();
  const isEdit = !!visa;
  const [file, setFile] = React.useState<File | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<VisaFormInput>({
    resolver: zodResolver(visaFormSchema),
    defaultValues: EMPTY,
    values: visa
      ? {
          employee_id: visa.employeeId,
          visa_number: visa.visaNumber,
          visa_type: visa.visaType,
          sponsor: visa.sponsor ?? "",
          passport_number: visa.passportNumber ?? "",
          issue_date: visa.issueDate,
          expiry_date: visa.expiryDate,
          renewal_date: visa.renewalDate ?? "",
          status: visa.status,
          notes: visa.notes ?? "",
        }
      : undefined,
  });

  function reset() {
    form.reset(EMPTY);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(values: VisaFormInput) {
    const fd = new FormData();
    if (isEdit) fd.set("id", visa!.id);
    fd.set("employee_id", values.employee_id);
    fd.set("visa_number", values.visa_number);
    fd.set("visa_type", values.visa_type);
    if (values.sponsor) fd.set("sponsor", values.sponsor);
    if (values.passport_number) fd.set("passport_number", values.passport_number);
    fd.set("issue_date", values.issue_date);
    fd.set("expiry_date", values.expiry_date);
    if (values.renewal_date) fd.set("renewal_date", values.renewal_date);
    fd.set("status", values.status);
    if (values.notes) fd.set("notes", values.notes);
    if (file) fd.set("file", file);

    const result = isEdit
      ? await updateVisaAction(fd)
      : await createVisaAction(fd);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Visa updated." : "Visa added.");
    if (!isEdit) reset();
    onOpenChange(false);
    router.refresh();
  }

  const text = (
    name: keyof VisaFormInput,
    label: string,
    type = "text",
    placeholder?: string,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
            />
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit visa" : "Add visa"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this visa record and its documents."
              : "Register a visa against an employee and passport."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="visa-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <FormField
                control={form.control}
                name="visa_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visa type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VISA_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {text("visa_number", "Visa number", "text", "e.g. 201/2024/…")}
              {text("passport_number", "Passport number")}
              {text("sponsor", "Sponsor")}
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
                        {VISA_STATUSES.map((s) => (
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
              ) : isEdit && visa?.attachmentName ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="size-3" />
                  Current: {visa.attachmentName} (upload to replace)
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
            form="visa-form"
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
              "Add visa"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
