"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  uploadEmployeePhotoAction,
  uploadEmployeeSignatureAction,
} from "../actions/employee.actions";
import { PHOTO_ACCEPTED_TYPES, PHOTO_MAX_BYTES } from "../constants";

/**
 * Uploads an employee photo or signature via a server action (private handling,
 * public URL saved on the record). `trigger` lets the caller supply the visible
 * element (e.g. the avatar) that opens the file picker.
 */
export function EmployeeImageUploader({
  employeeId,
  kind,
  canManage,
  children,
  buttonLabel,
  className,
}: {
  employeeId: string;
  kind: "photo" | "signature";
  canManage: boolean;
  children?: React.ReactNode;
  buttonLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState(false);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!PHOTO_ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Image must be a PNG, JPG, or WEBP.");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      toast.error("Image must be 3 MB or smaller.");
      return;
    }
    const formData = new FormData();
    formData.set("employeeId", employeeId);
    formData.set("file", file);

    setPending(true);
    const action =
      kind === "photo"
        ? uploadEmployeePhotoAction
        : uploadEmployeeSignatureAction;
    const result = await action(formData);
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(kind === "photo" ? "Photo updated." : "Signature updated.");
    router.refresh();
  }

  if (!canManage) return <>{children}</>;

  return (
    <div className={cn("inline-flex", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={onFile}
      />
      {children ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="group relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={buttonLabel ?? `Upload ${kind}`}
        >
          {children}
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            {pending ? (
              <Loader2 className="size-5 animate-spin text-white" />
            ) : (
              <Upload className="size-5 text-white" />
            )}
          </span>
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="size-4" />
              {buttonLabel ?? "Upload"}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
