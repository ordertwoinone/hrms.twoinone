import * as React from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";

/**
 * Root provider stack, mounted once in the root layout. Order matters:
 *   ThemeProvider → QueryProvider → TooltipProvider → app
 * The Toaster is rendered as a sibling so notifications float above everything.
 *
 * `AuthProvider` is intentionally NOT here — it needs the server-resolved user
 * and is mounted in the (dashboard) layout where that user is available.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Toaster position="top-right" richColors closeButton />
      </QueryProvider>
    </ThemeProvider>
  );
}
