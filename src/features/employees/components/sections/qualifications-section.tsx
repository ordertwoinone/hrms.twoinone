"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { EmptyState } from "@/components/shared/empty-state";
import { ActionMenu } from "@/components/shared/action-menu";
import {
  addQualification,
  deleteEmployeeSection,
  updateQualification,
} from "../../actions/employee-sections.actions";
import {
  qualificationSchema,
  type QualificationInput,
} from "../../schemas/sections.schema";
import type { Qualification } from "../../types";
import { SectionCard } from "../section-card";

export function QualificationsSection({
  employeeId,
  qualifications,
  canManage,
}: {
  employeeId: string;
  qualifications: Qualification[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Qualification | null>(null);

  async function onDelete(id: string) {
    const result = await deleteEmployeeSection({
      section: "qualifications",
      id,
    });
    if (!result.success) return toast.error(result.error);
    toast.success("Qualification removed.");
    router.refresh();
  }

  return (
    <SectionCard
      title="Qualifications"
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
      {qualifications.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No qualifications"
          description="Add education history here."
          className="border-0"
        />
      ) : (
        <ul className="divide-y">
          {qualifications.map((q) => (
            <li
              key={q.id}
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">
                  {q.degree}
                  {q.field_of_study ? ` · ${q.field_of_study}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[
                    q.institution,
                    [q.start_year, q.end_year].filter(Boolean).join("–"),
                    q.grade,
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
                          setEditing(q);
                          setOpen(true);
                        },
                      },
                    ],
                    [
                      {
                        label: "Delete",
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => void onDelete(q.id),
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
        <QualificationDialog
          key={editing?.id ?? "new"}
          open={open}
          onOpenChange={setOpen}
          employeeId={employeeId}
          qualification={editing}
        />
      )}
    </SectionCard>
  );
}

function QualificationDialog({
  open,
  onOpenChange,
  employeeId,
  qualification,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  qualification: Qualification | null;
}) {
  const router = useRouter();
  const form = useForm<QualificationInput>({
    resolver: zodResolver(qualificationSchema),
    defaultValues: {
      employee_id: employeeId,
      degree: qualification?.degree ?? "",
      institution: qualification?.institution ?? "",
      field_of_study: qualification?.field_of_study ?? "",
      start_year: qualification?.start_year?.toString() ?? "",
      end_year: qualification?.end_year?.toString() ?? "",
      grade: qualification?.grade ?? "",
    },
  });

  async function onSubmit(values: QualificationInput) {
    const result = qualification
      ? await updateQualification({ id: qualification.id, ...values })
      : await addQualification(values);
    if (!result.success) return toast.error(result.error);
    toast.success(
      qualification ? "Qualification updated." : "Qualification added.",
    );
    onOpenChange(false);
    router.refresh();
  }

  const text = (name: keyof QualificationInput, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {qualification ? "Edit qualification" : "Add qualification"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="qualification-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {text("degree", "Degree")}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {text("institution", "Institution")}
              {text("field_of_study", "Field of study")}
              {text("start_year", "Start year")}
              {text("end_year", "End year")}
              {text("grade", "Grade")}
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="qualification-form"
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
