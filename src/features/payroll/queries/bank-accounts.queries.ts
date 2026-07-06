import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BankAccountItem } from "../types";

type Emp = { first_name: string; last_name: string; employee_code: string | null } | null;
const empName = (e: Emp) => (e ? `${e.first_name} ${e.last_name}` : "—");

export async function getBankAccounts(params: {
  employeeId?: string;
} = {}): Promise<BankAccountItem[]> {
  const admin = createAdminClient();
  let q = admin
    .from("bank_accounts")
    .select(
      "id, employee_id, bank_name, account_number, iban, account_holder_name, currency, is_primary, status, notes, employee:employees!bank_accounts_employee_id_fkey(first_name, last_name, employee_code)",
    )
    .is("deleted_at", null)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.employeeId) q = q.eq("employee_id", params.employeeId);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((b) => ({
    id: b.id,
    employeeId: b.employee_id,
    employeeName: empName(b.employee as Emp),
    employeeCode: (b.employee as Emp)?.employee_code ?? null,
    bankName: b.bank_name,
    accountNumber: b.account_number,
    iban: b.iban,
    accountHolderName: b.account_holder_name,
    currency: b.currency,
    isPrimary: b.is_primary,
    status: b.status,
    notes: b.notes,
  }));
}
