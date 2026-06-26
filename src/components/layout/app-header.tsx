import { Breadcrumbs } from "./breadcrumbs";
import { MobileSidebar } from "./mobile-sidebar";
import { NavUser } from "./nav-user";
import { ThemeToggle } from "./theme-toggle";

/**
 * Sticky top header for the dashboard shell. Contains (left → right): the
 * mobile nav trigger, breadcrumbs, the theme toggle, and the user menu. Stays
 * pinned while the content area scrolls beneath it.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
      <MobileSidebar />
      <div className="flex-1">
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NavUser />
      </div>
    </header>
  );
}
