"use client";

import * as React from "react";
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
import { resetUserPassword } from "../actions/user.actions";
import type { UserListItem } from "../types";

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
}) {
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    if (!user) return;
    setPending(true);
    const result = await resetUserPassword({ id: user.id });
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`Password reset email sent to ${user.email}.`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send password reset</DialogTitle>
          <DialogDescription>
            We’ll email a reset link to{" "}
            <span className="font-medium text-foreground">{user?.email}</span>.
            Their current password stays valid until they set a new one.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" />
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
