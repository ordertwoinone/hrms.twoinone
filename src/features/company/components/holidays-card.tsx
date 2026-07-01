"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { addHoliday, deleteHoliday } from "../actions/company.actions";
import {
  addHolidaySchema,
  type AddHolidayInput,
} from "../schemas/company.schema";
import type { CompanyHoliday } from "../types";

export function HolidaysCard({
  companyId,
  holidays,
  canManage,
}: {
  companyId: string;
  holidays: CompanyHoliday[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function onDelete(id: string) {
    setDeletingId(id);
    const result = await deleteHoliday({ id });
    setDeletingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Holiday removed.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-[18px] text-muted-foreground" />
          Public holidays
        </CardTitle>
        {canManage && <AddHolidayDialog companyId={companyId} />}
      </CardHeader>
      <CardContent>
        {holidays.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No holidays added"
            description={
              canManage
                ? "Add public holidays to build your work calendar."
                : "Public holidays will appear here."
            }
            className="border-0"
          />
        ) : (
          <ul className="divide-y">
            {holidays.map((holiday) => (
              <li
                key={holiday.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 flex-col items-center justify-center rounded-lg border bg-muted text-center">
                    <span className="text-xs font-semibold leading-none">
                      {formatDate(holiday.holiday_date).split(" ")[0]}
                    </span>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {formatDate(holiday.holiday_date).split(" ")[1]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{holiday.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(holiday.holiday_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {holiday.is_recurring && (
                    <Badge variant="outline">Recurring</Badge>
                  )}
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${holiday.name}`}
                      disabled={deletingId === holiday.id}
                      onClick={() => onDelete(holiday.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {deletingId === holiday.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function AddHolidayDialog({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const form = useForm<AddHolidayInput>({
    resolver: zodResolver(addHolidaySchema),
    defaultValues: {
      company_id: companyId,
      name: "",
      holiday_date: "",
      is_recurring: false,
    },
  });

  async function onSubmit(values: AddHolidayInput) {
    const result = await addHoliday(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Holiday added.");
    form.reset({
      company_id: companyId,
      name: "",
      holiday_date: "",
      is_recurring: false,
    });
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="size-4" />
          Add holiday
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add public holiday</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="add-holiday-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holiday name</FormLabel>
                  <FormControl>
                    <Input placeholder="Eid Al Fitr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="holiday_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-muted-foreground">
                    Repeats every year
                  </FormLabel>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-holiday-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Adding…
              </>
            ) : (
              "Add holiday"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
