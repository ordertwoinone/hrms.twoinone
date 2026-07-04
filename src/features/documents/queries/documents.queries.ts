import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface DocumentListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  title: string;
  category: string | null;
  documentType: string;
  documentNumber: string | null;
  expiryDate: string | null;
  fileUrl: string | null;
  createdAt: string;
}

export async function getDocuments(params: {
  employeeId?: string;
  category?: string;
  expiringWithinDays?: number;
} = {}): Promise<DocumentListItem[]> {
  const admin = createAdminClient();

  let q = admin
    .from("employee_documents")
    .select(
      "id, employee_id, title, category, document_type, number, expiry_date, file_url, created_at, employee:employees!employee_documents_employee_id_fkey(first_name, last_name, employee_code)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (params.employeeId) q = q.eq("employee_id", params.employeeId);
  if (params.category) q = q.eq("category", params.category);

  if (params.expiringWithinDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + params.expiringWithinDays);
    q = q
      .not("expiry_date", "is", null)
      .lte("expiry_date", cutoff.toISOString().slice(0, 10))
      .gte("expiry_date", new Date().toISOString().slice(0, 10));
  }

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((d) => ({
    id: d.id,
    employeeId: d.employee_id,
    employeeName: d.employee
      ? `${d.employee.first_name} ${d.employee.last_name}`
      : "—",
    employeeNumber: d.employee?.employee_code ?? "—",
    title: d.title,
    category: d.category,
    documentType: d.document_type ?? "",
    documentNumber: d.number,
    expiryDate: d.expiry_date,
    fileUrl: d.file_url,
    createdAt: d.created_at,
  }));
}

export async function getDocumentSignedUrl(fileUrl: string): Promise<string | null> {
  if (!fileUrl) return null;
  const admin = createAdminClient();
  const path = fileUrl.split("/employee-documents/")[1];
  if (!path) return fileUrl;
  const { data } = await admin.storage
    .from("employee-documents")
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function getDocumentCategories(): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("employee_documents")
    .select("category")
    .is("deleted_at", null)
    .not("category", "is", null);
  const cats = [...new Set((data ?? []).map((d) => d.category as string))].sort();
  return cats;
}
