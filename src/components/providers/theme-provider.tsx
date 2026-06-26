"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps next-themes. Class-based dark mode toggling drives the CSS variables in
 * globals.css. The premium look defaults to light (white content area) but the
 * theme system is fully wired for dark mode.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
