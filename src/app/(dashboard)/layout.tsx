import { cookies } from "next/headers";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AuthProvider } from "@/components/providers/auth-provider";
import {
  SidebarProvider,
  SIDEBAR_COOKIE,
} from "@/components/providers/sidebar-provider";
import { requireAuth } from "@/lib/auth/session";

/**
 * Protected dashboard shell. This Server Component:
 *   1. Enforces authentication (`requireAuth` redirects to login if needed).
 *   2. Reads the persisted sidebar-collapsed cookie so the rail renders in the
 *      user's last state with no hydration flash.
 *   3. Hydrates the client `AuthProvider` and `SidebarProvider`.
 *   4. Lays out the premium shell: white rail · sticky header · #FAFAFA content.
 *
 * Desktop-first; the rail collapses to icons (or a sheet on mobile).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, cookieStore] = await Promise.all([requireAuth(), cookies()]);
  const defaultCollapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";

  return (
    <AuthProvider initialUser={user}>
      <SidebarProvider defaultCollapsed={defaultCollapsed}>
        <div className="flex min-h-screen bg-background">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 bg-canvas">
              <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
