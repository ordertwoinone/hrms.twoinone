"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  addExperience,
  deleteEmployeeSection,
  updateExperience,
} from "../../actions/employee-sections.actions";
import {
  experienceSchema,
  type ExperienceInput,
} from "../../schemas/sections.schema";
import type { Experience } from "../../types";
import { SectionCard } from "../section-card";

export function ExperienceSection({
  employeeId,
  experiences,
  canManage,
}: {
  employeeId: string;
  experiences: Experience[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Experience | null>(null);

  async function onDelete(id: string) {
    const result = await deleteEmployeeSection({ section: "experiences", id });
    if (!result.success) return toast.error(result.error);
    toast.success("Experience removed.");
    router.refresh();
  }

  return (
    <SectionCard
      title="Work experience"
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
      {experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience added"
          description="Add previous employment here."
          className="border-0"
        />
      ) : (
        <ul className="divide-y">
          {experiences.map((x) => (
            <li
              key={x.id}
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {x.job_title ? `${x.job_title} · ` : ""}
                  {x.company_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[
                    x.start_date ? formatDate(x.start_date) : null,
                    x.end_date ? formatDate(x.end_date) : "Present",
                  ]
                    .filter(Boolean)
                    .join(" – ") || "—"}
                </p>
                {x.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {x.description}
                  </p>
                )}
              </div>
              {canManage && (
                <ActionMenu
                  groups={[
                    [
                      {
                        label: "Edit",
                        icon: Pencil,
                        onSelect: () => {
                          setEditing(x);
                          setOpen(true);
                        },
                      },
                    ],
                    [
                      {
                        label: "Delete",
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => void onDelete(x.id),
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
        <ExperienceDialog
          key={editing?.id ?? "new"}
          open={open}
          onOpenChange={setOpen}
          employeeId={employeeId}
          experience={editing}
        />
      )}
    </SectionCard>
  );
}

function ExperienceDialog({
  open,
  onOpenChange,
  employeeId,
  experience,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  experience: Experience | null;
}) {
  const router = useRouter();
  const form = useForm<ExperienceInput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      employee_id: employeeId,
      company_name: experience?.company_name ?? "",
      job_title: experience?.job_title ?? "",
      start_date: experience?.start_date ?? "",
      end_date: experience?.end_date ?? "",
      description: experience?.description ?? "",
    },
  });

  async function onSubmit(values: ExperienceInput) {
    const result = experience
      ? await updateExperience({ id: experience.id, ...values })
      : await addExperience(values);
    if (!result.success) return toast.error(result.error);
    toast.success(experience ? "Experience updated." : "Experience added.");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {experience ? "Edit experience" : "Add experience"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="experience-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                    <FormLabel>End date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="experience-form"
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
