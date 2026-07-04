"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { formatDate, getInitials } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { updateMyContact } from "../actions/self-service.actions";
import {
  updateContactSchema,
  type UpdateContactInput,
} from "../schemas/self-service.schema";
import type { EssProfile } from "../types";

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function EssProfileView({ profile }: { profile: EssProfile }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const form = useForm<UpdateContactInput>({
    resolver: zodResolver(updateContactSchema),
    values: {
      phone: profile.phone ?? "",
      personal_email: profile.personalEmail ?? "",
      address_line: profile.addressLine ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
    },
  });

  async function onSubmit(input: UpdateContactInput) {
    const result = await updateMyContact(input);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Contact details updated.");
    setOpen(false);
    router.refresh();
  }

  const text = (name: keyof UpdateContactInput, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">My profile</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="size-4" />
          Update contact
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={profile.photoUrl ?? undefined} alt={profile.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(profile.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{profile.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {profile.designation ?? "—"}
              {profile.department ? ` · ${profile.department}` : ""}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {profile.code}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Work email" value={profile.workEmail} />
          <Field label="Personal email" value={profile.personalEmail} />
          <Field label="Phone" value={profile.phone} />
          <Field label="Branch" value={profile.branch} />
          <Field label="Joined" value={profile.dateOfJoining ? formatDate(profile.dateOfJoining) : null} />
          <Field label="Status" value={profile.status} />
          <Field label="Address" value={profile.addressLine} />
          <Field label="City" value={profile.city} />
          <Field label="Country" value={profile.country} />
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update contact information</DialogTitle>
            <DialogDescription>
              Keep your contact details current for HR communications.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id="contact-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {text("phone", "Phone")}
              {text("personal_email", "Personal email")}
              <div className="sm:col-span-2">{text("address_line", "Address")}</div>
              {text("city", "City")}
              {text("country", "Country")}
            </form>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="contact-form"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
