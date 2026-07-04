import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface JobPostingItem {
  id: string;
  title: string;
  department: string | null;
  designation: string | null;
  location: string | null;
  status: string;
  headcount: number;
  publishedAt: string | null;
  closesAt: string | null;
  applicationCount: number;
  hiredCount: number;
  createdAt: string;
}

export interface CandidateItem {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  currentTitle: string | null;
  yearsExperience: number | null;
  source: string | null;
  createdAt: string;
  applicationCount: number;
}

export interface ApplicationItem {
  id: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string | null;
  stage: string;
  rating: number | null;
  appliedAt: string;
  assignedTo: string | null;
}

export async function getJobPostings(): Promise<JobPostingItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("job_postings")
    .select(
      "id, title, location, status, headcount, published_at, closes_at, created_at, department:departments(name), designation:designations(name), applications:job_applications(id, stage)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (data ?? []).map((p) => {
    const apps = (p.applications ?? []) as Array<{ id: string; stage: string }>;
    return {
      id: p.id,
      title: p.title,
      department: p.department?.name ?? null,
      designation: p.designation?.name ?? null,
      location: p.location,
      status: p.status,
      headcount: p.headcount,
      publishedAt: p.published_at,
      closesAt: p.closes_at,
      applicationCount: apps.length,
      hiredCount: apps.filter((a) => a.stage === "hired").length,
      createdAt: p.created_at,
    };
  });
}

export async function getCandidates(): Promise<CandidateItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("candidates")
    .select(
      "id, full_name, email, phone, nationality, current_title, years_experience, source, created_at, applications:job_applications(id)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (data ?? []).map((c) => ({
    id: c.id,
    fullName: c.full_name,
    email: c.email,
    phone: c.phone,
    nationality: c.nationality,
    currentTitle: c.current_title,
    yearsExperience: c.years_experience,
    source: c.source,
    createdAt: c.created_at,
    applicationCount: (c.applications ?? []).length,
  }));
}

export async function getApplications(jobPostingId?: string): Promise<ApplicationItem[]> {
  const admin = createAdminClient();
  let q = admin
    .from("job_applications")
    .select(
      "id, stage, rating, applied_at, assigned_to, job_posting:job_postings(title), candidate:candidates(full_name, email)",
    )
    .order("applied_at", { ascending: false });

  if (jobPostingId) q = q.eq("job_posting_id", jobPostingId);

  const { data } = await q;
  return (data ?? []).map((a) => ({
    id: a.id,
    jobTitle: a.job_posting?.title ?? "—",
    candidateName: a.candidate?.full_name ?? "—",
    candidateEmail: a.candidate?.email ?? null,
    stage: a.stage,
    rating: a.rating,
    appliedAt: a.applied_at,
    assignedTo: a.assigned_to,
  }));
}

export const PIPELINE_STAGES = [
  "applied",
  "screening",
  "phone_screen",
  "interview",
  "technical",
  "offer",
  "hired",
  "rejected",
] as const;
