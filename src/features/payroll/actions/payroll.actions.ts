"use server";

import { revalidatePath } from "next/cache";

import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUsers } from "@/features/notifications/server/notify";
import { computePayslip, periodLabel, round2 } from "../constants";
import { getSalaryStructures } from "../queries/payroll.queries";
import {
  createRunSchema,
  deleteLoanSchema,
  loanFormSchema,
  reviewRunSchema,
  reviseSalarySchema,
  updateLoanSchema,
  updatePayslipSchema,
} from "../schemas/payroll.schema";

type AdminClient = ReturnType<typeof createAdminClient>;
const num = (v: unknown) => Number(v ?? 0);
const norm = (v: string | undefined | null) => (v && v.length > 0 ? v : null);

async function getPrimaryCompanyId(admin: AdminClient): Promise<string> {
  const { data } = await admin
    .from("companies")
    .select("id")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) throw new ActionError("No company is configured yet.");
  return data.id;
}

async function recomputeRunTotals(
  admin: AdminClient,
  runId: string,
  userId: string,
) {
  const { data: slips } = await admin
    .from("payslips")
    .select("gross, deductions, loan_deduction, tax, net")
    .eq("run_id", runId);
  let gross = 0;
  let deductions = 0;
  let net = 0;
  for (const s of slips ?? []) {
    gross += num(s.gross);
    deductions += num(s.deductions) + num(s.loan_deduction) + num(s.tax);
    net += num(s.net);
  }
  await admin
    .from("payroll_runs")
    .update({
      total_gross: round2(gross),
      total_deductions: round2(deductions),
      total_net: round2(net),
      employee_count: (slips ?? []).length,
      updated_by: userId,
    })
    .eq("id", runId);
}

// ── Salary structure / revision ──
export const reviseSalary = createAction({
  input: reviseSalarySchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin.from("employee_salaries").insert({
      employee_id: input.employee_id,
      effective_date: input.effective_date,
      currency: input.currency,
      basic: input.basic,
      housing_allowance: input.housing_allowance,
      transport_allowance: input.transport_allowance,
      other_allowances: input.other_allowances,
      deductions: input.deductions,
      notes: norm(input.notes),
      created_by: user.id,
    });
    if (error) throw new ActionError(error.message);
    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "employee_salaries",
      entityId: input.employee_id,
    });
    revalidatePath(ROUTES.payroll);
    return { ok: true };
  },
});

// ── Loans ──
export const createLoan = createAction({
  input: loanFormSchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);
    const { error } = await admin.from("employee_loans").insert({
      company_id,
      employee_id: input.employee_id,
      loan_type: input.loan_type,
      principal: input.principal,
      monthly_deduction: input.monthly_deduction,
      outstanding: input.outstanding,
      start_date: input.start_date,
      status: input.status,
      notes: norm(input.notes),
      created_by: user.id,
    });
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.payroll);
    return { ok: true };
  },
});

export const updateLoan = createAction({
  input: updateLoanSchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("employee_loans")
      .update({
        employee_id: input.employee_id,
        loan_type: input.loan_type,
        principal: input.principal,
        monthly_deduction: input.monthly_deduction,
        outstanding: input.outstanding,
        start_date: input.start_date,
        status: input.status,
        notes: norm(input.notes),
        updated_by: user.id,
      })
      .eq("id", input.id)
      .is("deleted_at", null);
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.payroll);
    return { ok: true };
  },
});

export const deleteLoan = createAction({
  input: deleteLoanSchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("employee_loans")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id)
      .is("deleted_at", null);
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.payroll);
    return { ok: true };
  },
});

// ── Payroll runs ──
export const createPayrollRun = createAction({
  input: createRunSchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);

    const { data: existing } = await admin
      .from("payroll_runs")
      .select("id")
      .eq("company_id", company_id)
      .eq("period_year", input.period_year)
      .eq("period_month", input.period_month)
      .is("deleted_at", null)
      .maybeSingle();
    if (existing) {
      throw new ActionError("A payroll run already exists for this period.");
    }

    const structures = (await getSalaryStructures()).filter(
      (s) => s.effectiveDate !== null,
    );
    if (structures.length === 0) {
      throw new ActionError("No employees have a salary structure yet.");
    }

    const { data: loans } = await admin
      .from("employee_loans")
      .select("employee_id, monthly_deduction, outstanding")
      .is("deleted_at", null)
      .eq("status", "active");
    const loanByEmp = new Map<string, number>();
    for (const l of loans ?? []) {
      const ded = Math.min(num(l.monthly_deduction), num(l.outstanding));
      loanByEmp.set(l.employee_id, (loanByEmp.get(l.employee_id) ?? 0) + ded);
    }

    const currency = structures[0]!.currency;
    const { data: run, error } = await admin
      .from("payroll_runs")
      .insert({
        company_id,
        period_year: input.period_year,
        period_month: input.period_month,
        status: "draft",
        currency,
        notes: norm(input.notes),
        created_by: user.id,
      })
      .select("id")
      .single();
    if (error) throw new ActionError(error.message);

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    const rows = structures.map((s) => {
      const loanDed = round2(loanByEmp.get(s.employeeId) ?? 0);
      const { gross, net } = computePayslip({
        basic: s.basic,
        housing: s.housing,
        transport: s.transport,
        other: s.other,
        overtime: 0,
        bonus: 0,
        commission: 0,
        deductions: s.deductions,
        loan_deduction: loanDed,
        tax: 0,
      });
      totalGross += gross;
      totalDeductions += s.deductions + loanDed;
      totalNet += net;
      return {
        run_id: run.id,
        company_id,
        employee_id: s.employeeId,
        basic: s.basic,
        housing_allowance: s.housing,
        transport_allowance: s.transport,
        other_allowances: s.other,
        overtime: 0,
        bonus: 0,
        commission: 0,
        gross,
        deductions: s.deductions,
        loan_deduction: loanDed,
        tax: 0,
        net,
        currency: s.currency,
        created_by: user.id,
      };
    });

    const { error: pErr } = await admin.from("payslips").insert(rows);
    if (pErr) throw new ActionError(pErr.message);

    await admin
      .from("payroll_runs")
      .update({
        total_gross: round2(totalGross),
        total_deductions: round2(totalDeductions),
        total_net: round2(totalNet),
        employee_count: rows.length,
        updated_by: user.id,
      })
      .eq("id", run.id);

    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "payroll_runs",
      entityId: run.id,
    });
    revalidatePath(ROUTES.payroll);
    return { id: run.id };
  },
});

export const updatePayslip = createAction({
  input: updatePayslipSchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { data: slip } = await admin
      .from("payslips")
      .select(
        "id, run_id, basic, housing_allowance, transport_allowance, other_allowances, loan_deduction",
      )
      .eq("id", input.id)
      .maybeSingle();
    if (!slip) throw new ActionError("Payslip not found.");

    const { data: run } = await admin
      .from("payroll_runs")
      .select("status")
      .eq("id", slip.run_id)
      .maybeSingle();
    if (!run) throw new ActionError("Payroll run not found.");
    if (run.status === "paid" || run.status === "cancelled") {
      throw new ActionError("This run is locked and can no longer be edited.");
    }

    const { gross, net } = computePayslip({
      basic: num(slip.basic),
      housing: num(slip.housing_allowance),
      transport: num(slip.transport_allowance),
      other: num(slip.other_allowances),
      overtime: input.overtime,
      bonus: input.bonus,
      commission: input.commission,
      deductions: input.deductions,
      loan_deduction: num(slip.loan_deduction),
      tax: input.tax,
    });

    const { error } = await admin
      .from("payslips")
      .update({
        overtime: input.overtime,
        bonus: input.bonus,
        commission: input.commission,
        deductions: input.deductions,
        tax: input.tax,
        notes: norm(input.notes),
        gross,
        net,
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recomputeRunTotals(admin, slip.run_id, user.id);
    revalidatePath(`${ROUTES.payroll}/runs/${slip.run_id}`);
    return { ok: true };
  },
});

async function setRunStatus(
  admin: AdminClient,
  actorId: string,
  runId: string,
  from: string[],
  to: string,
  extra: Record<string, unknown> = {},
) {
  const { data: run } = await admin
    .from("payroll_runs")
    .select("status")
    .eq("id", runId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!run) throw new ActionError("Payroll run not found.");
  if (!from.includes(run.status)) {
    throw new ActionError("This run can no longer be actioned.");
  }
  const { error } = await admin
    .from("payroll_runs")
    .update({ status: to, updated_by: actorId, ...extra })
    .eq("id", runId);
  if (error) throw new ActionError(error.message);
  await recordAudit({
    actorId,
    action: "update",
    entity: "payroll_runs",
    entityId: runId,
    after: { status: to },
  });
  revalidatePath(`${ROUTES.payroll}/runs/${runId}`);
  revalidatePath(ROUTES.payroll);
}

export const submitPayrollRun = createAction({
  input: reviewRunSchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await setRunStatus(admin, user.id, input.run_id, ["draft"], "pending");
    return { ok: true };
  },
});

export const approvePayrollRun = createAction({
  input: reviewRunSchema,
  permission: PERMISSIONS.PAYROLL_APPROVE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await setRunStatus(admin, user.id, input.run_id, ["pending"], "approved", {
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    });
    return { ok: true };
  },
});

export const cancelPayrollRun = createAction({
  input: reviewRunSchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await setRunStatus(
      admin,
      user.id,
      input.run_id,
      ["draft", "pending", "approved"],
      "cancelled",
    );
    return { ok: true };
  },
});

/** Mark an approved run as paid and apply loan deductions to outstanding balances. */
export const markPayrollRunPaid = createAction({
  input: reviewRunSchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await setRunStatus(admin, user.id, input.run_id, ["approved"], "paid", {
      paid_at: new Date().toISOString(),
    });

    const { data: slips } = await admin
      .from("payslips")
      .select("employee_id, loan_deduction")
      .eq("run_id", input.run_id);
    for (const s of slips ?? []) {
      let remaining = num(s.loan_deduction);
      if (remaining <= 0) continue;
      const { data: loans } = await admin
        .from("employee_loans")
        .select("id, outstanding")
        .eq("employee_id", s.employee_id)
        .eq("status", "active")
        .is("deleted_at", null)
        .order("start_date", { ascending: true });
      for (const loan of loans ?? []) {
        if (remaining <= 0) break;
        const out = num(loan.outstanding);
        const pay = Math.min(out, remaining);
        const newOut = round2(out - pay);
        remaining = round2(remaining - pay);
        await admin
          .from("employee_loans")
          .update({
            outstanding: newOut,
            status: newOut <= 0 ? "closed" : "active",
            updated_by: user.id,
          })
          .eq("id", loan.id);
      }
    }

    // Notify employees (with portal accounts) that their payslip is ready.
    const { data: run } = await admin
      .from("payroll_runs")
      .select("period_year, period_month")
      .eq("id", input.run_id)
      .maybeSingle();
    const period = run
      ? periodLabel(run.period_year, run.period_month)
      : "the latest period";
    const empIds = [...new Set((slips ?? []).map((s) => s.employee_id))];
    if (empIds.length) {
      const { data: emps } = await admin
        .from("employees")
        .select("user_id")
        .in("id", empIds)
        .not("user_id", "is", null);
      const userIds = (emps ?? [])
        .map((e) => e.user_id)
        .filter((v): v is string => !!v);
      await notifyUsers(userIds, {
        category: "payroll",
        type: "success",
        title: `Payslip ready — ${period}`,
        body: "Your payslip for this period is now available.",
        link: ROUTES.selfService,
      });
    }
    return { ok: true };
  },
});
