"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

/**
 * The premium dark sidebar navigation. Renders grouped nav items from the
 * central `navigation` config, hides entries the user lacks permission for, and
 * highlights the active route. Shared by the desktop sidebar and the mobile
 * sheet so the navigation lives in exactly one place.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { can } = usePermissions();

  const isActive = React.useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {navigation.map((group) => {
        const visibleItems = group.items.filter(
          (item) => item.permission === null || can(item.permission),
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
              {group.label}
            </p>
            {visibleItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    active &&
                      "bg-sidebar-accent text-sidebar-foreground shadow-sm",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
