import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { AppProviders } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.company.legalName }],
  robots: { index: false, follow: false }, // internal app — keep out of search
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

/**
 * Root layout. Sets up the html document, the Geist Sans/Mono font variables,
 * and the global provider stack (theme, query, tooltips, toasts).
 * `suppressHydrationWarning` is required by next-themes because the theme class
 * is applied on the client before hydration.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(GeistSans.variable, GeistMono.variable)}
    >
      {/* suppressHydrationWarning: some browser extensions inject attributes
          (e.g. `cz-shortcut-listen`) onto <body> before hydration. This only
          suppresses attribute diffs one level deep, not real app mismatches. */}
      <body className="min-h-screen font-sans" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
