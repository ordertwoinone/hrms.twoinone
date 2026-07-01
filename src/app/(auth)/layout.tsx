import Link from "next/link";
import { Hexagon, ShieldCheck, Clock, FileCheck2 } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";

/**
 * Auth route-group layout. A clean, centered shell shared by login, forgot-
 * password, and reset-password. The left brand panel uses the solid teal accent
 * (no flashy gradients). This group is public; the middleware bounces
 * already-signed-in users away from it.
 */
const highlights = [
  { icon: ShieldCheck, text: "Bank-grade security with role-based access" },
  { icon: Clock, text: "Attendance, leave, and payroll in one place" },
  { icon: FileCheck2, text: "UAE compliance — WPS, visas, and documents" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel (hidden on small screens) */}
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link href={ROUTES.home} className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Hexagon className="size-5" strokeWidth={2.25} />
          </div>
          <span className="text-lg font-semibold">{siteConfig.name}</span>
        </Link>

        <div className="space-y-8">
          <blockquote className="max-w-md text-2xl font-medium leading-snug">
            The complete HR platform built for UAE businesses.
          </blockquote>
          <ul className="space-y-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="text-sm text-primary-foreground/90">
                    {item.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} {siteConfig.company.legalName}
        </footer>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-canvas p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
