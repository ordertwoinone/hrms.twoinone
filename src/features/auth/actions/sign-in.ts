"use server";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import type { Database } from "@/types/database.types";
import type { ActionResult } from "@/types/common";
import { env } from "@/lib/env";
import { loginSchema, type LoginInput } from "../schemas/auth.schema";

/**
 * Sign in with email + password (server-side, secure cookie session).
 *
 * Remember Me controls cookie persistence: when unchecked, the auth cookies are
 * written as session cookies (cleared when the browser closes); when checked,
 * Supabase's default persistent lifetime is used. Inactive accounts are blocked
 * even if their credentials are valid.
 */
export async function signInAction(raw: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(raw);
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

  const { email, password, rememberMe } = parsed.data;
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const opts: CookieOptions = rememberMe
              ? options
              : { ...options, maxAge: undefined, expires: undefined };
            cookieStore.set(name, value, opts);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, error: "Invalid email or password." };
  }

  // Block inactive/soft-deleted accounts even with valid credentials.
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Your account is inactive. Please contact an administrator.",
    };
  }

  // Best-effort last-sign-in stamp (self-update is allowed by RLS).
  await supabase
    .from("profiles")
    .update({ last_sign_in_at: new Date().toISOString() })
    .eq("id", data.user.id);

  return { success: true, data: undefined };
}
