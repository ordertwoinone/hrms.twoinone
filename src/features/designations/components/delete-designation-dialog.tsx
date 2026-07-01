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
import { deleteDesignation } from "../actions/designation.actions";
import type { DesignationListItem } from "../types";

export function DeleteDesignationDialog({
  open,
  onOpenChange,
  designation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designation: DesignationListItem | null;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    if (!designation) return;
    setPending(true);
    const result = await deleteDesignation({ id: designation.id });
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Designation deleted.");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete designation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {designation?.name}
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
              "Delete designation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
