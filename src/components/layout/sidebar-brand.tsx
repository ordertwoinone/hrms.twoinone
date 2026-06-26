import Link from "next/link";
import { Building2 } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";

/**
 * Brand lockup shown at the top of the sidebar. Links back to the dashboard.
 */
export function SidebarBrand() {
  return (
    <Link
      href={ROUTES.dashboard}
      className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Building2 className="h-5 w-5" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-sidebar-foreground">
          {siteConfig.name}
        </span>
        <span className="text-xs text-sidebar-foreground/50">
          HR Management
        </span>
      </div>
    </Link>
  );
}
