import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileEditor } from "@/features/profile/components/profile-editor";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await requireAuth();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email, avatar_url, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Update your personal details, avatar, and password."
      />
      <ProfileEditor
        user={{
          id: user.id,
          email: profile?.email ?? user.email ?? "",
          fullName: profile?.full_name ?? user.fullName,
          phone: profile?.phone ?? null,
          avatarUrl: profile?.avatar_url ?? user.avatarUrl ?? null,
          role: user.role,
        }}
      />
    </div>
  );
}
