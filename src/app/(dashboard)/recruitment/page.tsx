import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { RecruitmentWorkspace } from "@/features/recruitment/components/recruitment-workspace";
import {
  getJobPostings,
  getCandidates,
  getApplications,
} from "@/features/recruitment/queries/recruitment.queries";

export const metadata: Metadata = { title: "Recruitment" };

export default async function RecruitmentPage() {
  await requirePermission(PERMISSIONS.RECRUITMENT_VIEW);

  const [jobPostings, candidates, applications] = await Promise.all([
    getJobPostings(),
    getCandidates(),
    getApplications(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment"
        description="Manage job postings, candidates, and the hiring pipeline."
      />
      <RecruitmentWorkspace
        jobPostings={jobPostings}
        candidates={candidates}
        applications={applications}
      />
    </div>
  );
}
