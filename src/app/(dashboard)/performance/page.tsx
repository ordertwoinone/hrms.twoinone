import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { PerformanceWorkspace } from "@/features/performance/components/performance-workspace";
import {
  getPerformanceCycles,
  getPerformanceReviews,
} from "@/features/performance/queries/performance.queries";

export const metadata: Metadata = { title: "Performance Management" };

export default async function PerformancePage() {
  await requirePermission(PERMISSIONS.PERFORMANCE_VIEW);

  const [cycles, reviews] = await Promise.all([
    getPerformanceCycles(),
    getPerformanceReviews(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Management"
        description="Review cycles, goal tracking, and employee evaluations."
      />
      <PerformanceWorkspace cycles={cycles} reviews={reviews} />
    </div>
  );
}
