"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadCompanyLogoAction } from "../actions/company.actions";
import { LOGO_ACCEPTED_TYPES, LOGO_MAX_BYTES } from "../constants";

export function LogoUploader({
  companyId,
  logoUrl,
  canManage,
}: {
  companyId: string;
  logoUrl: string | null;
  canManage: boolean;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState(false);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!LOGO_ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Logo must be a PNG, JPG, WEBP, or SVG.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      toast.error("Logo must be 2 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.set("companyId", companyId);
    formData.set("file", file);

    setPending(true);
    const result = await uploadCompanyLogoAction(formData);
    setPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Logo updated.");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Company logo"
            className="size-full object-contain"
          />
        ) : (
          <Building2 className="size-8 text-muted-foreground" />
        )}
      </div>

      {canManage && (
        <div className="space-y-1.5">
          <input
            ref={inputRef}
            type="file"
            accept={LOGO_ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={onFile}
          />
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
                Upload logo
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP, or SVG. Max 2 MB.
          </p>
        </div>
      )}
    </div>
  );
}
