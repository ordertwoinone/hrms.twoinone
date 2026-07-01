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
import { deleteEmploymentType } from "../actions/employment-type.actions";
import type { EmploymentTypeListItem } from "../types";

export function DeleteEmploymentTypeDialog({
  open,
  onOpenChange,
  employmentType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employmentType: EmploymentTypeListItem | null;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    if (!employmentType) return;
    setPending(true);
    const result = await deleteEmploymentType({ id: employmentType.id });
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Employment type deleted.");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete employment type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {employmentType?.name}
            </span>
            ?
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
              "Delete type"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
