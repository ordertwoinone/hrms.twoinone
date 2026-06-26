import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Centered spinner for inline and full-section loading states. For route-level
 * loading prefer Suspense + skeletons (see `loading.tsx` files).
 */
export function LoadingSpinner({
  className,
  label = "Loading…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 py-12 text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
