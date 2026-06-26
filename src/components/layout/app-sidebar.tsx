import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav } from "./sidebar-nav";

/**
 * Desktop sidebar: a fixed, full-height dark rail. Hidden below the `lg`
 * breakpoint, where navigation moves into the slide-over sheet triggered from
 * the header. Layout: brand (top) · scrollable nav (middle).
 *
 * The dashboard grid reserves this column, so the sidebar is `position: fixed`
 * within it and never scrolls with the content area.
 */
export function AppSidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col bg-sidebar lg:flex">
      <SidebarBrand />
      <ScrollArea className="flex-1">
        <SidebarNav />
      </ScrollArea>
    </aside>
  );
}
