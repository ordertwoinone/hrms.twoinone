import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

/**
 * Login route — STRUCTURE ONLY.
 *
 * The real form belongs to the auth feature module
 * (`src/features/auth/components/login-form.tsx`) and will be built later. This
 * page just wires the route into the auth layout so the shell is navigable.
 */
export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue.
        </p>
      </div>
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Login form placeholder — implemented in{" "}
        <code className="font-mono">features/auth</code>.
      </div>
    </div>
  );
}
