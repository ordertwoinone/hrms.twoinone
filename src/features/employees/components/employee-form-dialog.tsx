"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEmployee, updateEmployee } from "../actions/employee.actions";
import {
  employeeFormSchema,
  type EmployeeFormInput,
} from "../schemas/employee.schema";
import { EMPLOYEE_STATUSES, GENDERS, MARITAL_STATUSES } from "../constants";
import type { Employee, EmployeeFormOptions } from "../types";

const NONE = "__none__";

const EMPTY: EmployeeFormInput = {
  employee_code: "",
  first_name: "",
  last_name: "",
  work_email: "",
  personal_email: "",
  phone: "",
  gender: "",
  date_of_birth: "",
  marital_status: "",
  nationality: "",
  department_id: "",
  designation_id: "",
  branch_id: "",
  employment_type_id: "",
  manager_id: "",
  date_of_joining: "",
  date_of_leaving: "",
  work_location: "",
  address_line: "",
  city: "",
  country: "",
  status: "active",
};

function Optional({
  label,
  value,
  onChange,
  options,
  placeholder = "None",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id?: string; value?: string; name?: string; label?: string }[];
  placeholder?: string;
}) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Select
        value={value ? value : NONE}
        onValueChange={(v) => onChange(v === NONE ? "" : v)}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value={NONE}>{placeholder}</SelectItem>
          {options.map((o) => {
            const val = (o.id ?? o.value)!;
            return (
              <SelectItem key={val} value={val}>
                {o.name ?? o.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  options,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  options: EmployeeFormOptions;
}) {
  const router = useRouter();
  const isEdit = !!employee;

  const form = useForm<EmployeeFormInput>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: EMPTY,
    values: employee
      ? {
          employee_code: employee.employee_code,
          first_name: employee.first_name,
          last_name: employee.last_name,
          work_email: employee.work_email ?? "",
          personal_email: employee.personal_email ?? "",
          phone: employee.phone ?? "",
          gender: (employee.gender ?? "") as EmployeeFormInput["gender"],
          date_of_birth: employee.date_of_birth ?? "",
          marital_status: employee.marital_status ?? "",
          nationality: employee.nationality ?? "",
          department_id: employee.department_id ?? "",
          designation_id: employee.designation_id ?? "",
          branch_id: employee.branch_id ?? "",
          employment_type_id: employee.employment_type_id ?? "",
          manager_id: employee.manager_id ?? "",
          date_of_joining: employee.date_of_joining ?? "",
          date_of_leaving: employee.date_of_leaving ?? "",
          work_location: employee.work_location ?? "",
          address_line: employee.address_line ?? "",
          city: employee.city ?? "",
          country: employee.country ?? "",
          status: employee.status as EmployeeFormInput["status"],
        }
      : undefined,
  });

  async function onSubmit(values: EmployeeFormInput) {
    const result = isEdit
      ? await updateEmployee({ id: employee!.id, ...values })
      : await createEmployee(values);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof EmployeeFormInput, {
            message: messages?.[0],
          });
        }
      }
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Employee updated." : "Employee created.");
    if (!isEdit) form.reset(EMPTY);
    onOpenChange(false);
    router.refresh();
  }

  const text = (
    name: keyof EmployeeFormInput,
    label: string,
    type = "text",
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this employee’s core details."
              : "Create a new employee record."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="employee-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Personal
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {text("first_name", "First name")}
                {text("last_name", "Last name")}
                {text("employee_code", "Employee code")}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <Optional
                      label="Gender"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={GENDERS}
                    />
                  )}
                />
                {text("date_of_birth", "Date of birth", "date")}
                <FormField
                  control={form.control}
                  name="marital_status"
                  render={({ field }) => (
                    <Optional
                      label="Marital status"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={MARITAL_STATUSES}
                    />
                  )}
                />
                {text("nationality", "Nationality")}
                {text("phone", "Phone")}
                {text("work_email", "Work email", "email")}
                {text("personal_email", "Personal email", "email")}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Job
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <Optional
                      label="Department"
                      placeholder="Unassigned"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={options.departments}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation_id"
                  render={({ field }) => (
                    <Optional
                      label="Designation"
                      placeholder="Unassigned"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={options.designations}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="branch_id"
                  render={({ field }) => (
                    <Optional
                      label="Branch"
                      placeholder="Unassigned"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={options.branches}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="employment_type_id"
                  render={({ field }) => (
                    <Optional
                      label="Employment type"
                      placeholder="Unassigned"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={options.employmentTypes}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="manager_id"
                  render={({ field }) => (
                    <Optional
                      label="Reports to"
                      placeholder="Unassigned"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={options.managers.filter(
                        (m) => m.id !== employee?.id,
                      )}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMPLOYEE_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {text("date_of_joining", "Date of joining", "date")}
                {text("date_of_leaving", "Date of leaving", "date")}
                {text("work_location", "Work location")}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Address
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  {text("address_line", "Address")}
                </div>
                {text("city", "City")}
                {text("country", "Country")}
              </div>
            </section>
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
            form="employee-form"
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
              "Create employee"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
