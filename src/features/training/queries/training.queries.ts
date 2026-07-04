import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface CourseItem {
  id: string;
  title: string;
  category: string | null;
  mode: string;
  durationHours: number | null;
  provider: string | null;
  scheduledDate: string | null;
  deadline: string | null;
  status: string;
  maxSeats: number | null;
  enrolledCount: number;
  completedCount: number;
  createdAt: string;
}

export interface EnrollmentItem {
  id: string;
  courseTitle: string;
  employeeName: string;
  employeeNumber: string;
  status: string;
  score: number | null;
  completionDate: string | null;
  enrolledAt: string;
}

export async function getTrainingCourses(): Promise<CourseItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("training_courses")
    .select(
      "id, title, category, mode, duration_hours, provider, scheduled_date, deadline, status, max_seats, created_at, enrollments:training_enrollments(id, status)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (data ?? []).map((c) => {
    const enrollments = (c.enrollments ?? []) as Array<{ id: string; status: string }>;
    return {
      id: c.id,
      title: c.title,
      category: c.category,
      mode: c.mode,
      durationHours: c.duration_hours,
      provider: c.provider,
      scheduledDate: c.scheduled_date,
      deadline: c.deadline,
      status: c.status,
      maxSeats: c.max_seats,
      enrolledCount: enrollments.filter((e) => e.status !== "withdrawn").length,
      completedCount: enrollments.filter((e) => e.status === "completed").length,
      createdAt: c.created_at,
    };
  });
}

export async function getEnrollments(courseId?: string): Promise<EnrollmentItem[]> {
  const admin = createAdminClient();
  let q = admin
    .from("training_enrollments")
    .select(
      "id, status, score, completion_date, enrolled_at, course:training_courses(title), employee:employees!training_enrollments_employee_id_fkey(first_name, last_name, employee_code)",
    )
    .order("enrolled_at", { ascending: false });

  if (courseId) q = q.eq("course_id", courseId);

  const { data } = await q;
  return (data ?? []).map((e) => ({
    id: e.id,
    courseTitle: e.course?.title ?? "—",
    employeeName: e.employee ? `${e.employee.first_name} ${e.employee.last_name}` : "—",
    employeeNumber: e.employee?.employee_code ?? "—",
    status: e.status,
    score: e.score,
    completionDate: e.completion_date,
    enrolledAt: e.enrolled_at,
  }));
}
