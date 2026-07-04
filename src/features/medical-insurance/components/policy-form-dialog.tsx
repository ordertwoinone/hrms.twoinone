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
  createPolicyAction,
  updatePolicyAction,
} from "../actions/policy.actions";
import { policyFormSchema, type PolicyFormInput } from "../schemas/policy.schema";
import { COVERAGE_TYPES, POLICY_STATUSES } from "../constants";
import type { PolicyFormOptions, PolicyListItem } from "../types";

const EMPTY: PolicyFormInput = {
  employee_id: "",
  provider: "",
  policy_number: "",
  coverage: "",
  dependents_covered: 0,
  issue_date: "",
  expiry_date: "",
  renewal_date: "",
  status: "active",
  claims_notes: "",
};

export function PolicyFormDialog({
  open,
  onOpenChange,
  options,
  record,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: PolicyFormOptions;
  record?: PolicyListItem | null;
}) {
  const router = useRouter();
  const isEdit = !!record;
  const [file, setFile] = React.useState<File | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<PolicyFormInput>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: EMPTY,
    values: record
      ? {
          employee_id: record.employeeId,
          provider: record.provider,
          policy_number: record.policyNumber,
          coverage: record.coverage,
          dependents_covered: record.dependentsCovered,
          issue_date: record.issueDate,
          expiry_date: record.expiryDate,
          renewal_date: record.renewalDate ?? "",
          status: record.status,
          claims_notes: record.claimsNotes ?? "",
        }
      : undefined,
  });

  function reset() {
    form.reset(EMPTY);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(values: PolicyFormInput) {
    const fd = new FormData();
    if (isEdit) fd.set("id", record!.id);
    fd.set("employee_id", values.employee_id);
    fd.set("provider", values.provider);
    fd.set("policy_number", values.policy_number);
    fd.set("coverage", values.coverage);
    fd.set("dependents_covered", String(values.dependents_covered));
    fd.set("issue_date", values.issue_date);
    fd.set("expiry_date", values.expiry_date);
    if (values.renewal_date) fd.set("renewal_date", values.renewal_date);
    fd.set("status", values.status);
    if (values.claims_notes) fd.set("claims_notes", values.claims_notes);
    if (file) fd.set("file", file);

    const result = isEdit
      ? await updatePolicyAction(fd)
      : await createPolicyAction(fd);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Policy updated." : "Policy added.");
    if (!isEdit) reset();
    onOpenChange(false);
    router.refresh();
  }

  const text = (name: keyof PolicyFormInput, label: string, type = "text") => (
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit policy" : "Add insurance policy"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this medical insurance policy and its document."
              : "Register a medical insurance policy for an employee."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="policy-form"
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
              {text("provider", "Insurance provider")}
              {text("policy_number", "Policy number")}
              <FormField
                control={form.control}
                name="coverage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coverage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select coverage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COVERAGE_TYPES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {text("dependents_covered", "Dependents covered", "number")}
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
                        {POLICY_STATUSES.map((s) => (
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
              name="claims_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claims notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Record claims history, pre-approvals, exclusions…"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>
                Policy document{" "}
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
            form="policy-form"
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
              "Add policy"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
