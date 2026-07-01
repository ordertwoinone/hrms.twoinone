"use server";

import { revalidatePath } from "next/cache";

import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/config/roles";
import {
  createUserSchema,
  resetUserPasswordSchema,
  setUserStatusSchema,
  updateUserSchema,
} from "../schemas/user.schema";

/**
 * User Management actions. Every action is gated by `user:manage` (held only by
 * Super Admin), runs privileged operations through the service-role admin
 * client (server-only — never the browser), and writes an audit log entry.
 */

type AdminClient = ReturnType<typeof createAdminClient>;

async function roleIdForKey(admin: AdminClient, key: Role): Promise<string> {
  const { data } = await admin
    .from("roles")
    .select("id")
    .eq("key", key)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) throw new ActionError("Selected role does not exist.");
  return data.id;
}

/** Create a user (no public registration; Super Admin only). */
export const createUser = createAction({
  input: createUserSchema,
  permission: PERMISSIONS.USER_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        role_key: input.roleKey,
        created_by: user.id,
      },
    });

    if (error || !data.user) {
      const message = error?.message ?? "";
      if (/registered|already|exists/i.test(message)) {
        throw new ActionError("A user with this email already exists.");
      }
      throw new ActionError(message || "Failed to create user.");
    }

    // The `handle_new_user` trigger created the profile; add the phone if given.
    if (input.phone) {
      await admin
        .from("profiles")
        .update({ phone: input.phone, updated_by: user.id })
        .eq("id", data.user.id);
    }

    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "users",
      entityId: data.user.id,
      after: {
        email: input.email,
        full_name: input.fullName,
        role: input.roleKey,
      },
    });

    revalidatePath(ROUTES.users);
    return { id: data.user.id };
  },
});

/** Update a user's profile and role. */
export const updateUser = createAction({
  input: updateUserSchema,
  permission: PERMISSIONS.USER_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    const { data: before } = await admin
      .from("profiles")
      .select("full_name, phone, role_id, status")
      .eq("id", input.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!before) throw new ActionError("User not found.");

    const role_id = await roleIdForKey(admin, input.roleKey);

    const { error } = await admin
      .from("profiles")
      .update({
        full_name: input.fullName,
        phone: input.phone ?? null,
        role_id,
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "users",
      entityId: input.id,
      before,
      after: { full_name: input.fullName, phone: input.phone ?? null, role_id },
    });

    revalidatePath(ROUTES.users);
    revalidatePath(`${ROUTES.users}/${input.id}`);
    return { id: input.id };
  },
});

/** Activate or deactivate a user (also bans/unbans login at the auth layer). */
export const setUserStatus = createAction({
  input: setUserStatusSchema,
  permission: PERMISSIONS.USER_MANAGE,
  handler: async ({ input, user }) => {
    if (input.id === user.id) {
      throw new ActionError("You can’t change your own status.");
    }
    const admin = createAdminClient();

    const { error } = await admin
      .from("profiles")
      .update({ status: input.status, updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await admin.auth.admin.updateUserById(input.id, {
      ban_duration: input.status === "inactive" ? "876600h" : "none",
    });

    await recordAudit({
      actorId: user.id,
      action: input.status === "inactive" ? "delete" : "restore",
      entity: "users",
      entityId: input.id,
      after: { status: input.status },
    });

    revalidatePath(ROUTES.users);
    revalidatePath(`${ROUTES.users}/${input.id}`);
    return { id: input.id };
  },
});

/** Send a password-reset email to a user. */
export const resetUserPassword = createAction({
  input: resetUserPasswordSchema,
  permission: PERMISSIONS.USER_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", input.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!profile) throw new ActionError("User not found.");

    const { error } = await admin.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${env.NEXT_PUBLIC_SITE_URL}${ROUTES.authCallback}?next=${ROUTES.resetPassword}`,
    });
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "users",
      entityId: input.id,
      metadata: { event: "password_reset_email_sent" },
    });

    return { id: input.id };
  },
});
