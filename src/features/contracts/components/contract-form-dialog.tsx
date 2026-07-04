"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  createContractAction,
  updateContractAction,
} from "../actions/contract.actions";
import {
  contractFormSchema,
  type ContractFormInput,
} from "../schemas/contract.schema";
import { CONTRACT_STATUSES, CONTRACT_TYPES } from "../constants";
import type { ContractFormOptions, ContractListItem } from "../types";

const EMPTY: ContractFormInput = {
  employee_id: "",
  contract_type: "",
  start_date: "",
  end_date: "",
  notice_period_days: 30,
  renewal_date: "",
  status: "draft",
  notes: "",
};

export function ContractFormDialog({
  open,
  onOpenChange,
  options,
  contract,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: ContractFormOptions;
  contract?: ContractListItem | null;
}) {
  const router = useRouter();
  const isEdit = !!contract;
  const offerRef = React.useRef<HTMLInputElement>(null);
  const contractRef = React.useRef<HTMLInputElement>(null);
  const attachmentRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ContractFormInput>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: EMPTY,
    values: contract
      ? {
          employee_id: contract.employeeId,
          contract_type: contract.contractType,
          start_date: contract.startDate,
          end_date: contract.endDate ?? "",
          notice_period_days: contract.noticePeriodDays,
          renewal_date: contract.renewalDate ?? "",
          status: contract.status,
          notes: contract.notes ?? "",
        }
      : undefined,
  });

  function reset() {
    form.reset(EMPTY);
    for (const r of [offerRef, contractRef, attachmentRef]) {
      if (r.current) r.current.value = "";
    }
  }

  async function onSubmit(values: ContractFormInput) {
    const fd = new FormData();
    if (isEdit) fd.set("id", contract!.id);
    fd.set("employee_id", values.employee_id);
    fd.set("contract_type", values.contract_type);
    fd.set("start_date", values.start_date);
    if (values.end_date) fd.set("end_date", values.end_date);
    fd.set("notice_period_days", String(values.notice_period_days));
    if (values.renewal_date) fd.set("renewal_date", values.renewal_date);
    fd.set("status", values.status);
    if (values.notes) fd.set("notes", values.notes);
    const offer = offerRef.current?.files?.[0];
    const contractDoc = contractRef.current?.files?.[0];
    const attachment = attachmentRef.current?.files?.[0];
    if (offer) fd.set("offer_letter", offer);
    if (contractDoc) fd.set("contract", contractDoc);
    if (attachment) fd.set("attachment", attachment);

    const result = isEdit
      ? await updateContractAction(fd)
      : await createContractAction(fd);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Contract updated." : "Contract created.");
    if (!isEdit) reset();
    onOpenChange(false);
    router.refresh();
  }

  const fileInput = (
    ref: React.RefObject<HTMLInputElement | null>,
    label: string,
  ) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        ref={ref}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
      />
    </div>
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
          <DialogTitle>{isEdit ? "Edit contract" : "New contract"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this contract, its dates, and documents."
              : "Create a contract record with offer letter and agreement documents."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="contract-form"
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
              <FormField
                control={form.control}
                name="contract_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTRACT_TYPES.map((t) => (
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
                        {CONTRACT_STATUSES.map((s) => (
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
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End date (blank = open-ended)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notice_period_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice period (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={365}
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
                name="renewal_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renewal date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">Documents</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {fileInput(offerRef, "Offer letter")}
                {fileInput(contractRef, "Employment contract")}
                {fileInput(attachmentRef, "Other attachment")}
              </div>
              {isEdit ? (
                <p className="text-xs text-muted-foreground">
                  Uploading a file replaces the existing one for that slot.
                </p>
              ) : null}
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
            form="contract-form"
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
              "Create contract"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
