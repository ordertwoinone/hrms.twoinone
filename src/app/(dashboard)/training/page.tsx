import type { Metadata } from "next";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { TrainingWorkspace } from "@/features/training/components/training-workspace";
import {
  getTrainingCourses,
  getEnrollments,
} from "@/features/training/queries/training.queries";

export const metadata: Metadata = { title: "Training & Learning" };

export default async function TrainingPage() {
  await requirePermission(PERMISSIONS.TRAINING_VIEW);

  const [courses, enrollments] = await Promise.all([
    getTrainingCourses(),
    getEnrollments(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training & Learning"
        description="Course catalog, enrollment management, and completion tracking."
      />
      <TrainingWorkspace courses={courses} enrollments={enrollments} />
    </div>
  );
}
