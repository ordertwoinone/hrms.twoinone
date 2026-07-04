"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { saveSystemPreferences } from "../actions/settings.actions";
import type { SystemPrefsData } from "../queries/settings.queries";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const TIMEZONES = ["Asia/Dubai", "Asia/Riyadh", "Asia/Kuwait", "Asia/Bahrain", "Asia/Qatar", "Asia/Muscat", "UTC"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const LANGUAGES = [{ value: "en", label: "English" }, { value: "ar", label: "Arabic" }];

const schema = z.object({
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.enum(["12h", "24h"]),
  language: z.string(),
  fiscalYearStartMonth: z.number().int().min(1).max(12),
  workWeekStart: z.enum(["sunday", "monday"]),
  workDays: z.array(z.string()).min(1, "Select at least one work day"),
  enableSelfService: z.boolean(),
  enableOvertimeModule: z.boolean(),
  enableRecruitmentModule: z.boolean(),
  enablePerformanceModule: z.boolean(),
  enableTrainingModule: z.boolean(),
  notifyLeaveApproval: z.boolean(),
  notifyContractExpiry: z.boolean(),
  notifyDocumentExpiry: z.boolean(),
  notifyBirthday: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function SystemPrefsForm({ defaults }: { defaults: SystemPrefsData }) {
  const [pending, start] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaults,
      timeFormat: defaults.timeFormat as "12h" | "24h",
      workWeekStart: defaults.workWeekStart as "sunday" | "monday",
    },
  });

  function onSubmit(values: FormValues) {
    start(async () => {
      const res = await saveSystemPreferences(values);
      if (res.success) toast.success("System preferences saved");
      else toast.error(res.error ?? "Failed to save");
    });
  }

  const MONTHS_LABELS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Locale & Format</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="timezone" render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dateFormat" render={({ field }) => (
              <FormItem>
                <FormLabel>Date Format</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {DATE_FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="timeFormat" render={({ field }) => (
              <FormItem>
                <FormLabel>Time Format</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="12h">12-hour</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name="language" render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name="fiscalYearStartMonth" render={({ field }) => (
              <FormItem>
                <FormLabel>Fiscal Year Start</FormLabel>
                <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {MONTHS_LABELS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Work Week</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="workWeekStart" render={({ field }) => (
              <FormItem>
                <FormLabel>Week Starts On</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="w-40"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <Controller
              control={form.control}
              name="workDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Days</FormLabel>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {DAYS.map((day) => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer capitalize">
                        <Checkbox
                          checked={field.value.includes(day)}
                          onCheckedChange={(checked) => {
                            if (checked) field.onChange([...field.value, day]);
                            else field.onChange(field.value.filter((d) => d !== day));
                          }}
                        />
                        <span className="text-sm capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Module Visibility</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([
              ["enableSelfService", "Self Service Portal"],
              ["enableOvertimeModule", "Overtime Management"],
              ["enableRecruitmentModule", "Recruitment / ATS"],
              ["enablePerformanceModule", "Performance Management"],
              ["enableTrainingModule", "Training & Learning"],
            ] as const).map(([name, label]) => (
              <FormField key={name} control={form.control} name={name} render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel className="font-normal">{label}</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Email Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([
              ["notifyLeaveApproval", "Leave approvals"],
              ["notifyContractExpiry", "Contract expiry alerts"],
              ["notifyDocumentExpiry", "Document expiry alerts"],
              ["notifyBirthday", "Employee birthdays"],
            ] as const).map(([name, label]) => (
              <FormField key={name} control={form.control} name={name} render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel className="font-normal">{label}</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save Preferences"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
