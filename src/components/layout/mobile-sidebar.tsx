"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";

/**
 * Mobile/tablet navigation. Controlled by the sidebar provider's `openMobile`
 * state (the header's menu button toggles it). Renders the same brand, nav, and
 * user blocks as the desktop rail, and auto-closes on route change.
 */
export function MobileSidebar() {
  const { openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent
        side="left"
        className="flex w-sidebar flex-col bg-sidebar p-0"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarBrand />
        <ScrollArea className="flex-1">
          <SidebarNav onNavigate={() => setOpenMobile(false)} />
        </ScrollArea>
        <SidebarUser />
      </SheetContent>
    </Sheet>
  );
}
