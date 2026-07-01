import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";
import { ensureSuperAdminBootstrap } from "@/lib/auth/bootstrap";

export const metadata: Metadata = {
  title: "Sign in",
};

/**
 * Login page. Runs the first-run Super Admin bootstrap (no-op once any user
 * exists), then renders the secure login form. There is no public sign-up.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  await ensureSuperAdminBootstrap();
  const { redirectTo } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue.
        </p>
      </div>
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
