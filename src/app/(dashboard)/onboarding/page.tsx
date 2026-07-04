import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { OnboardingWorkspace } from "@/features/onboarding/components/onboarding-workspace";
import {
  getChecklists,
  getTemplates,
} from "@/features/onboarding/queries/onboarding.queries";

export const metadata: Metadata = { title: "Onboarding & Offboarding" };

export default async function OnboardingPage() {
  await requirePermission(PERMISSIONS.ONBOARDING_VIEW);

  const [checklists, templates] = await Promise.all([
    getChecklists(),
    getTemplates(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding & Offboarding"
        description="Manage employee onboarding checklists, tasks, and offboarding workflows."
      />
      <OnboardingWorkspace checklists={checklists} templates={templates} />
    </div>
  );
}
