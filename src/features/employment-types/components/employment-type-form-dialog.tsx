"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
  createEmploymentType,
  updateEmploymentType,
} from "../actions/employment-type.actions";
import {
  employmentTypeFormSchema,
  type EmploymentTypeFormInput,
} from "../schemas/employment-type.schema";
import type { EmploymentTypeListItem } from "../types";

const EMPTY: EmploymentTypeFormInput = {
  name: "",
  description: "",
  status: "active",
};

export function EmploymentTypeFormDialog({
  open,
  onOpenChange,
  employmentType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employmentType?: EmploymentTypeListItem | null;
}) {
  const router = useRouter();
  const isEdit = !!employmentType;

  const form = useForm<EmploymentTypeFormInput>({
    resolver: zodResolver(employmentTypeFormSchema),
    defaultValues: EMPTY,
    values: employmentType
      ? {
          name: employmentType.name,
          description: employmentType.description ?? "",
          status: employmentType.status,
        }
      : undefined,
  });

  async function onSubmit(values: EmploymentTypeFormInput) {
    const result = isEdit
      ? await updateEmploymentType({ id: employmentType!.id, ...values })
      : await createEmploymentType(values);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof EmploymentTypeFormInput, {
            message: messages?.[0],
          });
        }
      }
      toast.error(result.error);
      return;
    }
    toast.success(
      isEdit ? "Employment type updated." : "Employment type created.",
    );
    if (!isEdit) form.reset(EMPTY);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit employment type" : "Create employment type"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this employment type."
              : "Add a custom employment type."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="employment-type-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Consultant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="When to use this type…"
                      {...field}
                    />
                  </FormControl>
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
            form="employment-type-form"
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
              "Create type"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
