"use client";

import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/providers/sidebar-provider";

/**
 * Toggles the sidebar: collapses/expands the rail on desktop, opens/closes the
 * slide-over on mobile. Bound to the same action as `Ctrl/Cmd + B`.
 */
export function SidebarToggle() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="text-muted-foreground" />
    </Button>
  );
}
