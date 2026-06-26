"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

/**
 * Route-segment error boundary. Catches render/runtime errors thrown by Server
 * and Client Components in this segment and offers a recovery action. Must be a
 * Client Component (Next.js requirement).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    logger.error("Route error boundary", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          An unexpected error occurred. You can try again, and if the problem
          persists, contact support.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
