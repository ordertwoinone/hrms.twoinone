import Link from "next/link";
import { Building2 } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";

/**
 * Auth route-group layout. A clean, centered shell shared by login, forgot-
 * password, and reset-password. This group is public (no auth required); the
 * middleware bounces already-signed-in users away from it.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel (hidden on small screens) */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Link href={ROUTES.home} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">{siteConfig.name}</span>
        </Link>
        <blockquote className="space-y-2">
          <p className="text-lg leading-relaxed text-sidebar-foreground/80">
            “The complete HR platform built for UAE businesses — employees,
            attendance, leave, and payroll in one secure place.”
          </p>
          <footer className="text-sm text-sidebar-foreground/50">
            {siteConfig.company.legalName}
          </footer>
        </blockquote>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
