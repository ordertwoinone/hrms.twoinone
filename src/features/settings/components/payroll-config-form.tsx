"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
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
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { savePayrollConfig } from "../actions/settings.actions";
import type { PayrollConfigData } from "../queries/settings.queries";

const schema = z.object({
  overtimeRateWeekday: z.number().min(1).max(5),
  overtimeRateWeekend: z.number().min(1).max(5),
  overtimeRateHoliday: z.number().min(1).max(5),
  housingAllowance: z.number().min(0),
  transportAllowance: z.number().min(0),
  mealAllowance: z.number().min(0),
  otherAllowance: z.number().min(0),
  payrollDay: z.number().int().min(1).max(28),
  currency: z.string().max(3),
  gratuityEnabled: z.boolean(),
  gratuity5yrRate: z.number().min(0).max(30),
  gratuity5yrPlusRate: z.number().min(0).max(30),
  agentId: z.string().nullable().optional(),
  employerId: z.string().nullable().optional(),
  bankRoutingCode: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

export function PayrollConfigForm({ defaults }: { defaults: PayrollConfigData }) {
  const [pending, start] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaults, agentId: defaults.agentId ?? "", employerId: defaults.employerId ?? "", bankRoutingCode: defaults.bankRoutingCode ?? "" },
  });

  function onSubmit(values: FormValues) {
    start(async () => {
      const res = await savePayrollConfig(values);
      if (res.success) toast.success("Payroll configuration saved");
      else toast.error(res.error ?? "Failed to save");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overtime Rates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {(["overtimeRateWeekday", "overtimeRateWeekend", "overtimeRateHoliday"] as const).map((field) => (
              <FormField
                key={field}
                control={form.control}
                name={field}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>
                      {field === "overtimeRateWeekday" ? "Weekday" : field === "overtimeRateWeekend" ? "Weekend" : "Holiday"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={0.25}
                        {...f}
                        onChange={(e) => f.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>× hourly rate</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Allowances (AED)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {([
              ["housingAllowance", "Housing Allowance"],
              ["transportAllowance", "Transport Allowance"],
              ["mealAllowance", "Meal Allowance"],
              ["otherAllowance", "Other Allowance"],
            ] as const).map(([field, label]) => (
              <FormField
                key={field}
                control={form.control}
                name={field}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...f}
                        onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gratuity (UAE Labor Law)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="gratuityEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Enable Gratuity Calculation</FormLabel>
                    <FormDescription>Auto-include in payroll</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gratuity5yrRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days/year (first 5 yrs)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={30} {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gratuity5yrPlusRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days/year (after 5 yrs)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={30} {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">WPS Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="agentId" render={({ field }) => (
              <FormItem>
                <FormLabel>WPS Agent ID</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="employerId" render={({ field }) => (
              <FormItem>
                <FormLabel>Employer ID (MOL)</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="bankRoutingCode" render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Bank Routing Code</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save Configuration"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
