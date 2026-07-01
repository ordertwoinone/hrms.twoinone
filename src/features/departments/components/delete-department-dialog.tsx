"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteDepartment } from "../actions/department.actions";
import type { DepartmentListItem } from "../types";

export function DeleteDepartmentDialog({
  open,
  onOpenChange,
  department,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: DepartmentListItem | null;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    if (!department) return;
    setPending(true);
    const result = await deleteDepartment({ id: department.id });
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Department deleted.");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete department</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {department?.name}
            </span>
            ? Departments with sub-departments must be emptied first.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete department"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
