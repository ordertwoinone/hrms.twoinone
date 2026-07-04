"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/utils";
import { Badge } from "@/components/ui/badge";
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
  addAsset,
  deleteEmployeeSection,
  updateAsset,
} from "../../actions/employee-sections.actions";
import { assetSchema, type AssetInput } from "../../schemas/sections.schema";
import { ASSET_STATUSES } from "../../constants";
import type { EmployeeAsset } from "../../types";
import { SectionCard } from "../section-card";

export function AssetsSection({
  employeeId,
  assets,
  canManage,
}: {
  employeeId: string;
  assets: EmployeeAsset[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmployeeAsset | null>(null);

  async function onDelete(id: string) {
    const result = await deleteEmployeeSection({
      section: "employee_assets",
      id,
    });
    if (!result.success) return toast.error(result.error);
    toast.success("Asset removed.");
    router.refresh();
  }

  return (
    <SectionCard
      title="Assets"
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
      {assets.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No assets assigned"
          description="Track company assets issued to this employee."
          className="border-0"
        />
      ) : (
        <ul className="divide-y">
          {assets.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{a.name}</p>
                  <Badge
                    variant={a.status === "assigned" ? "primary" : "outline"}
                  >
                    {a.status === "assigned" ? "Assigned" : "Returned"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {[
                    a.asset_tag,
                    a.category,
                    a.assigned_date
                      ? `Issued ${formatDate(a.assigned_date)}`
                      : null,
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
                          setEditing(a);
                          setOpen(true);
                        },
                      },
                    ],
                    [
                      {
                        label: "Delete",
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => void onDelete(a.id),
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
        <AssetDialog
          key={editing?.id ?? "new"}
          open={open}
          onOpenChange={setOpen}
          employeeId={employeeId}
          asset={editing}
        />
      )}
    </SectionCard>
  );
}

function AssetDialog({
  open,
  onOpenChange,
  employeeId,
  asset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  asset: EmployeeAsset | null;
}) {
  const router = useRouter();
  const form = useForm<AssetInput>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      employee_id: employeeId,
      name: asset?.name ?? "",
      asset_tag: asset?.asset_tag ?? "",
      category: asset?.category ?? "",
      assigned_date: asset?.assigned_date ?? "",
      return_date: asset?.return_date ?? "",
      status: (asset?.status ?? "assigned") as AssetInput["status"],
      notes: asset?.notes ?? "",
    },
  });

  async function onSubmit(values: AssetInput) {
    const result = asset
      ? await updateAsset({ id: asset.id, ...values })
      : await addAsset(values);
    if (!result.success) return toast.error(result.error);
    toast.success(asset ? "Asset updated." : "Asset added.");
    onOpenChange(false);
    router.refresh();
  }

  const text = (name: keyof AssetInput, label: string, type = "text") => (
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit asset" : "Add asset"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="asset-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {text("name", "Asset name")}
              {text("asset_tag", "Asset tag")}
              {text("category", "Category")}
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
                        {ASSET_STATUSES.map((s) => (
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
              {text("assigned_date", "Assigned date", "date")}
              {text("return_date", "Return date", "date")}
            </div>
            {text("notes", "Notes")}
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="asset-form"
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
