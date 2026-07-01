import Link from "next/link";
import { Hexagon } from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";

/**
 * Brand lockup at the top of the sidebar. Collapses to just the logo mark when
 * the rail is collapsed.
 */
export function SidebarBrand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href={ROUTES.dashboard}
      className={cn(
        "flex h-header items-center gap-2.5 border-b border-sidebar-border px-4",
        collapsed && "justify-center px-0",
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Hexagon className="size-5" strokeWidth={2.25} />
      </div>
      {!collapsed && (
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-foreground">
            {siteConfig.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            HR Management
          </span>
        </div>
      )}
    </Link>
  );
}
