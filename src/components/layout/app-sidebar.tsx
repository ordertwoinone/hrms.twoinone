"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";

/**
 * Desktop sidebar: a fixed, full-height white rail with a subtle right border.
 * Width animates between 260px (expanded) and 72px (collapsed, icon-only).
 * Hidden below `lg`, where navigation moves into the mobile sheet.
 *
 * Layout: brand (top) · scrollable nav (middle) · user profile (bottom).
 */
export function AppSidebar() {
  const { collapsed } = useSidebar();

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out lg:flex",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar",
      )}
    >
      <SidebarBrand collapsed={collapsed} />
      <ScrollArea className="flex-1">
        <SidebarNav collapsed={collapsed} />
      </ScrollArea>
      <SidebarUser collapsed={collapsed} />
    </aside>
  );
}
