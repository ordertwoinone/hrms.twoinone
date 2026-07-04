"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  addEmergencyContact,
  deleteEmployeeSection,
  updateEmergencyContact,
} from "../../actions/employee-sections.actions";
import {
  emergencyContactSchema,
  type EmergencyContactInput,
} from "../../schemas/sections.schema";
import type { EmergencyContact } from "../../types";
import { SectionCard } from "../section-card";

export function EmergencyContactsSection({
  employeeId,
  contacts,
  canManage,
}: {
  employeeId: string;
  contacts: EmergencyContact[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmergencyContact | null>(null);

  async function onDelete(id: string) {
    const result = await deleteEmployeeSection({
      section: "emergency_contacts",
      id,
    });
    if (!result.success) return toast.error(result.error);
    toast.success("Contact removed.");
    router.refresh();
  }

  return (
    <SectionCard
      title="Emergency contacts"
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
      {contacts.length === 0 ? (
        <EmptyState
          title="No emergency contacts"
          description="Add a contact for emergencies."
          className="border-0"
        />
      ) : (
        <ul className="divide-y">
          {contacts.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{c.name}</p>
                  {c.is_primary && <Badge variant="primary">Primary</Badge>}
                  {c.relationship && (
                    <span className="text-xs text-muted-foreground">
                      {c.relationship}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{c.phone}</p>
                {(c.email || c.address) && (
                  <p className="text-xs text-muted-foreground">
                    {[c.email, c.address].filter(Boolean).join(" · ")}
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
                          setEditing(c);
                          setOpen(true);
                        },
                      },
                    ],
                    [
                      {
                        label: "Delete",
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => void onDelete(c.id),
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
        <ContactDialog
          key={editing?.id ?? "new"}
          open={open}
          onOpenChange={setOpen}
          employeeId={employeeId}
          contact={editing}
        />
      )}
    </SectionCard>
  );
}

function ContactDialog({
  open,
  onOpenChange,
  employeeId,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  contact: EmergencyContact | null;
}) {
  const router = useRouter();
  const form = useForm<EmergencyContactInput>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      employee_id: employeeId,
      name: contact?.name ?? "",
      relationship: contact?.relationship ?? "",
      phone: contact?.phone ?? "",
      email: contact?.email ?? "",
      address: contact?.address ?? "",
      is_primary: contact?.is_primary ?? false,
    },
  });

  async function onSubmit(values: EmergencyContactInput) {
    const result = contact
      ? await updateEmergencyContact({ id: contact.id, ...values })
      : await addEmergencyContact(values);
    if (!result.success) return toast.error(result.error);
    toast.success(contact ? "Contact updated." : "Contact added.");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {contact ? "Edit contact" : "Add emergency contact"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="contact-form"
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
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input placeholder="Spouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-muted-foreground">
                    Primary contact
                  </FormLabel>
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
            form="contact-form"
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
