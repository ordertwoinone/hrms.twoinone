"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import { EmptyState } from "@/components/shared/empty-state";
import { ActionMenu } from "@/components/shared/action-menu";
import {
  addDependent,
  deleteEmployeeSection,
  updateDependent,
} from "../../actions/employee-sections.actions";
import {
  dependentSchema,
  type DependentInput,
} from "../../schemas/sections.schema";
import { GENDERS } from "../../constants";
import type { Dependent } from "../../types";
import { SectionCard } from "../section-card";

const NONE = "__none__";

export function DependentsSection({
  employeeId,
  dependents,
  canManage,
}: {
  employeeId: string;
  dependents: Dependent[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Dependent | null>(null);

  async function onDelete(id: string) {
    const result = await deleteEmployeeSection({ section: "dependents", id });
    if (!result.success) return toast.error(result.error);
    toast.success("Dependent removed.");
    router.refresh();
  }

  return (
    <SectionCard
      title="Dependents"
      action={
        canManage ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add
          </Button>
        ) : null
      }
    >
      {dependents.length === 0 ? (
        <EmptyState
          title="No dependents"
          description="Add family dependents here."
          className="border-0"
        />
      ) : (
        <ul className="divide-y">
          {dependents.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[
                    d.relationship,
                    d.gender,
                    d.date_of_birth ? formatDate(d.date_of_birth) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
              </div>
              {canManage && (
                <ActionMenu
                  groups={[
                    [
                      {
                        label: "Edit",
                        icon: Pencil,
                        onSelect: () => {
                          setEditing(d);
                          setOpen(true);
                        },
                      },
                    ],
                    [
                      {
                        label: "Delete",
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => void onDelete(d.id),
                      },
                    ],
                  ]}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <DependentDialog
          key={editing?.id ?? "new"}
          open={open}
          onOpenChange={setOpen}
          employeeId={employeeId}
          dependent={editing}
        />
      )}
    </SectionCard>
  );
}

function DependentDialog({
  open,
  onOpenChange,
  employeeId,
  dependent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  dependent: Dependent | null;
}) {
  const router = useRouter();
  const form = useForm<DependentInput>({
    resolver: zodResolver(dependentSchema),
    defaultValues: {
      employee_id: employeeId,
      name: dependent?.name ?? "",
      relationship: dependent?.relationship ?? "",
      date_of_birth: dependent?.date_of_birth ?? "",
      gender: (dependent?.gender ?? "") as DependentInput["gender"],
    },
  });

  async function onSubmit(values: DependentInput) {
    const result = dependent
      ? await updateDependent({ id: dependent.id, ...values })
      : await addDependent(values);
    if (!result.success) return toast.error(result.error);
    toast.success(dependent ? "Dependent updated." : "Dependent added.");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {dependent ? "Edit dependent" : "Add dependent"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="dependent-form"
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input placeholder="Child" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      value={field.value ? field.value : NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>—</SelectItem>
                        {GENDERS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
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
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="dependent-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
