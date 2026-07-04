import type { Metadata } from "next";
import { CircleUserRound } from "lucide-react";

import { requireAuth } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and update your personal details, password, and notification preferences."
      />
      <EmptyState
        icon={CircleUserRound}
        title="Coming soon"
        description="The Profile page is under active development and will be available in the next release."
      />
    </div>
  );
}
