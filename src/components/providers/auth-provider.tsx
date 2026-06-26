"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { AuthContextValue, AuthUser } from "@/types/auth";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";

const AuthContext = React.createContext<AuthContextValue | null>(null);

/**
 * Client-side auth context. Hydrated with the `initialUser` resolved on the
 * server (in the dashboard layout), so there is no auth flash on first paint.
 * Client components read the current user and permissions via `useAuth`.
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user] = React.useState<AuthUser | null>(initialUser);

  const signOut = React.useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace(ROUTES.login);
    router.refresh();
  }, [router]);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, isLoading: false, signOut }),
    [user, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the authenticated user and auth actions inside client components. */
export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return ctx;
}
