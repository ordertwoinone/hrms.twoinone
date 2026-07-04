import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/auth/session";
import { getBellData } from "@/features/notifications/queries/notifications.queries";
import { Breadcrumbs } from "./breadcrumbs";
import { MobileSidebar } from "./mobile-sidebar";
import { CommandMenu } from "./command-menu";
import { HeaderSearch } from "./header-search";
import { Notifications } from "./notifications";
import { CompanySwitcher } from "./company-switcher";
import { QuickActions } from "./quick-actions";
import { SidebarToggle } from "./sidebar-toggle";
import { ThemeToggle } from "./theme-toggle";
import { NavUser } from "./nav-user";

/**
 * Sticky top header (72px) for the dashboard shell.
 *
 * Left:  sidebar toggle · company switcher · breadcrumbs (current page).
 * Right: search (⌘K) · quick action · notifications · theme · profile.
 *
 * The mobile sheet and command palette are mounted here (they portal to the
 * body) so the whole navigation surface lives with the header.
 */
export async function AppHeader() {
  const user = await getCurrentUser();
  const bell = user
    ? await getBellData(user.id)
    : { items: [], unreadCount: 0 };

  return (
    <header className="sticky top-0 z-30 flex h-header items-center gap-2 border-b bg-card/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarToggle />
      <CompanySwitcher />
      <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />
      <div className="hidden min-w-0 flex-1 md:block">
        <Breadcrumbs />
      </div>
      <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
        <HeaderSearch />
        <QuickActions />
        <Notifications items={bell.items} unread={bell.unreadCount} />
        <ThemeToggle />
        <Separator
          orientation="vertical"
          className="mx-1 hidden h-6 sm:block"
        />
        <NavUser />
      </div>

      <MobileSidebar />
      <CommandMenu />
    </header>
  );
}
