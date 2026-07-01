"use client";

import * as React from "react";
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
  createDepartment,
  updateDepartment,
} from "../actions/department.actions";
import {
  departmentFormSchema,
  type DepartmentFormInput,
} from "../schemas/department.schema";
import type { DepartmentFormOptions, DepartmentListItem } from "../types";

const NONE = "__none__";

const EMPTY: DepartmentFormInput = {
  name: "",
  code: "",
  description: "",
  branch_id: "",
  head_id: "",
  parent_id: "",
  status: "active",
};

/** Collect a department's descendant ids so they can't be chosen as its parent. */
function getDescendantIds(
  departments: DepartmentListItem[],
  rootId: string,
): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const d of departments) {
    if (!d.parentId) continue;
    const list = childrenOf.get(d.parentId);
    if (list) list.push(d.id);
    else childrenOf.set(d.parentId, [d.id]);
  }
  const result = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop()!;
    for (const childId of childrenOf.get(current) ?? []) {
      if (!result.has(childId)) {
        result.add(childId);
        stack.push(childId);
      }
    }
  }
  return result;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  departments,
  options,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: DepartmentListItem | null;
  departments: DepartmentListItem[];
  options: DepartmentFormOptions;
}) {
  const router = useRouter();
  const isEdit = !!department;

  const parentOptions = React.useMemo(() => {
    if (!department) return departments;
    const blocked = getDescendantIds(departments, department.id);
    return departments.filter(
      (d) => d.id !== department.id && !blocked.has(d.id),
    );
  }, [departments, department]);

  const form = useForm<DepartmentFormInput>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: EMPTY,
    values: department
      ? {
          name: department.name,
          code: department.code,
          description: department.description ?? "",
          branch_id: department.branchId ?? "",
          head_id: department.headId ?? "",
          parent_id: department.parentId ?? "",
          status: department.status,
        }
      : undefined,
  });

  async function onSubmit(values: DepartmentFormInput) {
    const result = isEdit
      ? await updateDepartment({ id: department!.id, ...values })
      : await createDepartment(values);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof DepartmentFormInput, {
            message: messages?.[0],
          });
        }
      }
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Department updated." : "Department created.");
    if (!isEdit) form.reset(EMPTY);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit department" : "Create department"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this department’s details and hierarchy."
              : "Add a new department to your company."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="department-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department name</FormLabel>
                    <FormControl>
                      <Input placeholder="Human Resources" {...field} />
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
                      <Input placeholder="HR" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="What this department does…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent department</FormLabel>
                    <Select
                      value={field.value ? field.value : NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None (top level)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>None (top level)</SelectItem>
                        {parentOptions.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
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
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      value={field.value ? field.value : NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Unassigned</SelectItem>
                        {options.branches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
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
                name="head_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department head</FormLabel>
                    <Select
                      value={field.value ? field.value : NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Unassigned</SelectItem>
                        {options.heads.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name}
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
            form="department-form"
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
              "Create department"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
