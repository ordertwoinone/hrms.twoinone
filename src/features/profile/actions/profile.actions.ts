"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/server/audit";
import type { ActionResult } from "@/types/common";

const ProfileSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().max(30).nullable().optional(),
});

export async function updateProfile(
  input: z.infer<typeof ProfileSchema>,
): Promise<ActionResult<{ updated: true }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      updated_by: user.id,
    })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  await recordAudit({ actorId: user.id, action: "update", entity: "profile", entityId: user.id });
  return { success: true, data: { updated: true } };
}

export async function uploadAvatar(
  formData: FormData,
): Promise<ActionResult<{ avatarUrl: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  const file = formData.get("file") as File | null;
  if (!file || !file.size) return { success: false, error: "No file provided" };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { success: false, error: "File must be PNG, JPG, or WEBP" };
  }
  if (file.size > 3 * 1024 * 1024) return { success: false, error: "File must be under 3 MB" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `avatars/${user.id}.${ext}`;
  const bytes = await file.arrayBuffer();

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("company")
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (uploadError) return { success: false, error: uploadError.message };

  const { data: urlData } = admin.storage.from("company").getPublicUrl(path);
  const avatarUrl = urlData.publicUrl;

  const { error: dbError } = await admin
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_by: user.id })
    .eq("id", user.id);
  if (dbError) return { success: false, error: dbError.message };

  return { success: true, data: { avatarUrl } };
}

export async function changePassword(input: {
  newPassword: string;
}): Promise<ActionResult<{ changed: true }>> {
  if (!input.newPassword || input.newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: input.newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true, data: { changed: true } };
}
