import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set new password",
};

/**
 * Reset-password route — STRUCTURE ONLY. Reached from the email recovery link
 * (Supabase establishes a recovery session via the auth callback). The set-new-
 * password form ships with the auth feature module later.
 */
export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Set a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Reset-password form placeholder — implemented in{" "}
        <code className="font-mono">features/auth</code>.
      </div>
    </div>
  );
}
