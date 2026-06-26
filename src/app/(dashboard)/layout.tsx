import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AuthProvider } from "@/components/providers/auth-provider";
import { requireAuth } from "@/lib/auth/session";

/**
 * Protected dashboard shell. This Server Component:
 *   1. Enforces authentication (`requireAuth` redirects to login if needed).
 *   2. Hydrates the client `AuthProvider` with the resolved user so client
 *      components get the user + permissions with no auth flash.
 *   3. Lays out the premium shell: fixed dark sidebar + sticky header + a
 *      scrollable white content area.
 *
 * Desktop-first grid; the sidebar collapses into a sheet below `lg`.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <AuthProvider initialUser={user}>
      <div className="flex min-h-screen bg-muted/30">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
