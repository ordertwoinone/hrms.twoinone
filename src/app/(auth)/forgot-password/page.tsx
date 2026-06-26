import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Forgot password",
};

/**
 * Forgot-password route — STRUCTURE ONLY. The request-reset form ships with the
 * auth feature module later.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we’ll send you a reset link.
        </p>
      </div>
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Forgot-password form placeholder — implemented in{" "}
        <code className="font-mono">features/auth</code>.
      </div>
      <p className="text-center text-sm text-muted-foreground">
        <Link href={ROUTES.login} className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
