import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface CycleItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "closed";
  selfReviewDeadline: string | null;
  managerReviewDeadline: string | null;
  reviewCount: number;
  submittedCount: number;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  cycleName: string;
  employeeName: string;
  reviewerName: string | null;
  type: string;
  status: string;
  overallRating: number | null;
  submittedAt: string | null;
}

export async function getPerformanceCycles(): Promise<CycleItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("performance_cycles")
    .select(
      "id, name, start_date, end_date, status, self_review_deadline, manager_review_deadline, created_at, reviews:performance_reviews(id, status)",
    )
    .is("deleted_at", null)
    .order("start_date", { ascending: false });

  return (data ?? []).map((c) => {
    const reviews = (c.reviews ?? []) as Array<{ id: string; status: string }>;
    return {
      id: c.id,
      name: c.name,
      startDate: c.start_date,
      endDate: c.end_date,
      status: c.status as CycleItem["status"],
      selfReviewDeadline: c.self_review_deadline,
      managerReviewDeadline: c.manager_review_deadline,
      reviewCount: reviews.length,
      submittedCount: reviews.filter((r) => r.status === "submitted" || r.status === "acknowledged").length,
      createdAt: c.created_at,
    };
  });
}

export async function getPerformanceReviews(cycleId?: string): Promise<ReviewItem[]> {
  const admin = createAdminClient();
  let q = admin
    .from("performance_reviews")
    .select(
      "id, type, status, overall_rating, submitted_at, cycle:performance_cycles(name), employee:employees!performance_reviews_employee_id_fkey(first_name, last_name), reviewer:employees!performance_reviews_reviewer_id_fkey(first_name, last_name)",
    )
    .order("created_at", { ascending: false });

  if (cycleId) q = q.eq("cycle_id", cycleId);

  const { data } = await q;
  return (data ?? []).map((r) => ({
    id: r.id,
    cycleName: r.cycle?.name ?? "—",
    employeeName: r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : "—",
    reviewerName: r.reviewer ? `${r.reviewer.first_name} ${r.reviewer.last_name}` : null,
    type: r.type,
    status: r.status,
    overallRating: r.overall_rating,
    submittedAt: r.submitted_at,
  }));
}
