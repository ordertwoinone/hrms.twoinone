"use server";

import type { ActionResult } from "@/types/common";
import { env } from "@/lib/env";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "../schemas/auth.schema";

/**
 * Send a password-reset email. Always reports success so the form never reveals
 * whether an email is registered (anti-enumeration). The link routes through
 * the auth callback, which establishes a recovery session and forwards to
 * /reset-password.
 */
export async function requestPasswordResetAction(
  raw: ForgotPasswordInput,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL}${ROUTES.authCallback}?next=${ROUTES.resetPassword}`,
  });

  return { success: true, data: undefined };
}

/**
 * Set a new password. Requires the recovery session established by the reset
 * link (via the auth callback). No public registration path exists.
 */
export async function resetPasswordAction(
  raw: ResetPasswordInput,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Your reset link is invalid or has expired. Request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}
