import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Access denied",
};

/**
 * 403 page. Permission guards redirect here when an authenticated user lacks
 * the required permission. The shell (sidebar/header) stays intact so the user
 * can navigate elsewhere.
 */
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="size-7 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-destructive">403</p>
        <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          You don’t have permission to view this page. If you think this is a
          mistake, contact your administrator.
        </p>
      </div>
      <Button asChild>
        <Link href={ROUTES.dashboard}>Back to dashboard</Link>
      </Button>
    </div>
  );
}
