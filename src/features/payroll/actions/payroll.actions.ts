"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUsers } from "@/features/notifications/server/notify";
import {
  computePayslip,
  periodLabel,
  round2,
  workingDaysInMonth,
} from "../constants";
import {
  getSalaryStructures,
  getAttendanceForPeriod,
  getOvertimeForPeriod,
} from "../queries/payroll.queries";
import { getActiveAdvancesForPayroll } from "../queries/advances.queries";
import { getApprovedBonusesForPeriod } from "../queries/bonuses.queries";
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

async function recomputeRunTotals(admin: AdminClient, runId: string, userId: string) {
  const { data: slips } = await admin
    .from("payslips")
    .select("gross, deductions, loan_deduction, advance_deduction, penalty, tax, net, social_security_employee")
    .eq("run_id", runId);
  let gross = 0, deductions = 0, net = 0;
  for (const s of slips ?? []) {
    gross += num(s.gross);
    deductions +=
      num(s.deductions) + num(s.loan_deduction) + num(s.advance_deduction) +
      num(s.penalty) + num(s.tax) + num(s.social_security_employee);
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

// ── Salary structure / revision ──────────────────────────────────────────────
export const reviseSalary = createAction({
  input: reviseSalarySchema,
  permission: PERMISSIONS.SALARY_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { data, error } = await admin.from("employee_salaries").insert({
      employee_id: input.employee_id,
      effective_date: input.effective_date,
      currency: input.currency,
      basic: input.basic,
      housing_allowance: input.housing_allowance,
      transport_allowance: input.transport_allowance,
      food_allowance: input.food_allowance,
      telephone_allowance: input.telephone_allowance,
      other_allowances: input.other_allowances,
      commission_fixed: input.commission_fixed,
      deductions: input.deductions,
      overtime_rate_multiplier: input.overtime_rate_multiplier,
      social_security_employee_pct: input.social_security_employee_pct,
      social_security_employer_pct: input.social_security_employer_pct,
      notes: norm(input.notes),
      created_by: user.id,
    }).select("id").single();
    if (error) throw new ActionError(error.message);
    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "employee_salaries",
      entityId: data.id,
    });
    revalidatePath(ROUTES.payrollSalaryStructures);
    revalidatePath(ROUTES.payroll);
    return { ok: true };
  },
});

// ── Loans ─────────────────────────────────────────────────────────────────────
export const createLoan = createAction({
  input: loanFormSchema,
  permission: PERMISSIONS.LOAN_MANAGE,
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
    revalidatePath(ROUTES.payrollLoans);
    revalidateTag("payroll-dashboard");
    return { ok: true };
  },
});

export const updateLoan = createAction({
  input: updateLoanSchema,
  permission: PERMISSIONS.LOAN_MANAGE,
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
    revalidatePath(ROUTES.payrollLoans);
    revalidateTag("payroll-dashboard");
    return { ok: true };
  },
});

export const deleteLoan = createAction({
  input: deleteLoanSchema,
  permission: PERMISSIONS.LOAN_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("employee_loans")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id)
      .is("deleted_at", null);
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.payrollLoans);
    revalidateTag("payroll-dashboard");
    return { ok: true };
  },
});

// ── Payroll runs ──────────────────────────────────────────────────────────────
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
    if (existing) throw new ActionError("A payroll run already exists for this period.");

    const structures = (await getSalaryStructures()).filter((s) => s.effectiveDate !== null);
    if (structures.length === 0) throw new ActionError("No employees have a salary structure yet.");

    const workingDays = workingDaysInMonth(input.period_year, input.period_month);

    // Fetch all integration data in parallel
    const [loanData, advanceData, bonusData, attendanceMap, overtimeMap] =
      await Promise.all([
        admin
          .from("employee_loans")
          .select("employee_id, monthly_deduction, outstanding")
          .is("deleted_at", null)
          .eq("status", "active"),
        getActiveAdvancesForPayroll(),
        getApprovedBonusesForPeriod(input.period_year, input.period_month),
        getAttendanceForPeriod(input.period_year, input.period_month),
        getOvertimeForPeriod(input.period_year, input.period_month),
      ]);

    // Build per-employee deduction maps
    const loanByEmp = new Map<string, number>();
    for (const l of loanData.data ?? []) {
      const ded = Math.min(num(l.monthly_deduction), num(l.outstanding));
      loanByEmp.set(l.employee_id, (loanByEmp.get(l.employee_id) ?? 0) + ded);
    }

    const advanceByEmp = new Map<string, { total: number; advanceIds: string[] }>();
    for (const a of advanceData) {
      const ded = Math.min(a.monthlyDeduction, a.outstanding);
      const existing = advanceByEmp.get(a.employeeId) ?? { total: 0, advanceIds: [] };
      existing.total = round2(existing.total + ded);
      existing.advanceIds.push(a.id);
      advanceByEmp.set(a.employeeId, existing);
    }

    const bonusByEmp = new Map<string, { total: number; bonusIds: string[] }>();
    for (const b of bonusData) {
      const existing = bonusByEmp.get(b.employeeId) ?? { total: 0, bonusIds: [] };
      existing.total = round2(existing.total + b.amount);
      existing.bonusIds.push(b.id);
      bonusByEmp.set(b.employeeId, existing);
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

    let totalGross = 0, totalDeductions = 0, totalNet = 0;

    const rows = structures.map((s) => {
      const att = attendanceMap.get(s.employeeId);
      const ot = overtimeMap.get(s.employeeId);
      const presentDays = att?.present ?? workingDays;
      const absentDays = att?.absent ?? 0;

      // OT amount = (basic / working_days) * ot_rate * ot_hours
      const dailyBasic = workingDays > 0 ? s.basic / workingDays : 0;
      const otHours = ot?.hours ?? 0;
      const otAmount = round2(dailyBasic * s.overtimeRateMultiplier * otHours);

      const loanDed = round2(loanByEmp.get(s.employeeId) ?? 0);
      const advanceDed = round2(advanceByEmp.get(s.employeeId)?.total ?? 0);
      const bonusAmount = round2(bonusByEmp.get(s.employeeId)?.total ?? 0);

      const { gross, net, ssEmployee } = computePayslip({
        basic: s.basic,
        housing: s.housing,
        transport: s.transport,
        food: s.food,
        telephone: s.telephone,
        other: s.other,
        commissionFixed: s.commissionFixed,
        overtime: otAmount,
        bonus: bonusAmount,
        commission: 0,
        deductions: s.deductions,
        loan_deduction: loanDed,
        advance_deduction: advanceDed,
        penalty: 0,
        tax: 0,
        ssEmployeePct: s.ssEmployeePct,
        absentDays,
        workingDays,
      });

      const ssEmployer = round2(gross * s.ssEmployerPct);

      totalGross += gross;
      totalDeductions += s.deductions + loanDed + advanceDed + ssEmployee;
      totalNet += net;

      return {
        run_id: run.id,
        company_id,
        employee_id: s.employeeId,
        basic: s.basic,
        housing_allowance: s.housing,
        transport_allowance: s.transport,
        food_allowance: s.food,
        telephone_allowance: s.telephone,
        other_allowances: s.other,
        overtime: otAmount,
        ot_hours: otHours,
        ot_amount: otAmount,
        bonus: bonusAmount,
        commission: 0,
        gross,
        deductions: s.deductions,
        loan_deduction: loanDed,
        advance_deduction: advanceDed,
        penalty: 0,
        tax: 0,
        net,
        working_days: workingDays,
        present_days: presentDays,
        absent_days: absentDays,
        social_security_employee: ssEmployee,
        social_security_employer: ssEmployer,
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
    revalidatePath(ROUTES.payrollRuns);
    revalidateTag("payroll-runs");
    revalidateTag("payroll-dashboard");
    revalidateTag("dashboard");
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
        "id, run_id, basic, housing_allowance, transport_allowance, food_allowance, telephone_allowance, other_allowances, loan_deduction, advance_deduction, working_days, absent_days, social_security_employee",
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

    const workingDays = num(slip.working_days) || 22;
    const absentDays = num(slip.absent_days);
    const dailyBasicRate =
      workingDays > 0
        ? (num(slip.basic) + num(slip.housing_allowance) + num(slip.transport_allowance) +
           num(slip.food_allowance) + num(slip.telephone_allowance)) / workingDays
        : 0;
    const absentDeduction = round2(dailyBasicRate * absentDays);

    const gross = round2(
      num(slip.basic) +
      num(slip.housing_allowance) +
      num(slip.transport_allowance) +
      num(slip.food_allowance) +
      num(slip.telephone_allowance) +
      num(slip.other_allowances) +
      input.overtime +
      input.bonus +
      input.commission -
      absentDeduction,
    );

    const ssEmployee = num(slip.social_security_employee);
    const net = round2(
      Math.max(0, gross) -
      input.deductions -
      num(slip.loan_deduction) -
      num(slip.advance_deduction) -
      input.penalty -
      input.tax -
      ssEmployee,
    );

    const { error } = await admin
      .from("payslips")
      .update({
        overtime: input.overtime,
        ot_amount: input.overtime,
        bonus: input.bonus,
        commission: input.commission,
        deductions: input.deductions,
        penalty: input.penalty,
        tax: input.tax,
        notes: norm(input.notes),
        gross: Math.max(0, gross),
        net: Math.max(0, net),
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recomputeRunTotals(admin, slip.run_id, user.id);
    revalidatePath(`${ROUTES.payrollRuns}/${slip.run_id}`);
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
  revalidatePath(`${ROUTES.payrollRuns}/${runId}`);
  revalidatePath(ROUTES.payrollRuns);
  revalidatePath(ROUTES.payroll);
  revalidateTag("payroll-runs");
  revalidateTag("payroll-dashboard");
  revalidateTag("dashboard");
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
    await setRunStatus(admin, user.id, input.run_id, ["draft", "pending", "approved"], "cancelled");
    return { ok: true };
  },
});

export const markPayrollRunPaid = createAction({
  input: reviewRunSchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const now = new Date().toISOString();
    await setRunStatus(admin, user.id, input.run_id, ["approved"], "paid", {
      paid_at: now,
      locked_at: now,
      locked_by: user.id,
    });

    const { data: slips } = await admin
      .from("payslips")
      .select("employee_id, loan_deduction, advance_deduction")
      .eq("run_id", input.run_id);

    // Apply loan deductions and record loan payments
    for (const s of slips ?? []) {
      let remaining = num(s.loan_deduction);
      if (remaining > 0) {
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
            .update({ outstanding: newOut, status: newOut <= 0 ? "closed" : "active", updated_by: user.id })
            .eq("id", loan.id);
          await admin.from("loan_payments").insert({
            loan_id: loan.id,
            payroll_run_id: input.run_id,
            amount: pay,
            payment_date: now.slice(0, 10),
            payment_method: "salary_deduction",
            created_by: user.id,
          });
        }
      }

      // Apply advance deductions and record advance repayments
      let advRemaining = num(s.advance_deduction);
      if (advRemaining > 0) {
        const { data: advances } = await admin
          .from("salary_advances")
          .select("id, outstanding")
          .eq("employee_id", s.employee_id)
          .eq("status", "active")
          .is("deleted_at", null)
          .order("advance_date", { ascending: true });
        for (const adv of advances ?? []) {
          if (advRemaining <= 0) break;
          const out = num(adv.outstanding);
          const pay = Math.min(out, advRemaining);
          const newOut = round2(out - pay);
          advRemaining = round2(advRemaining - pay);
          await admin
            .from("salary_advances")
            .update({ outstanding: newOut, status: newOut <= 0 ? "closed" : "active", updated_by: user.id })
            .eq("id", adv.id);
          await admin.from("advance_repayments").insert({
            advance_id: adv.id,
            payroll_run_id: input.run_id,
            amount: pay,
            repayment_date: now.slice(0, 10),
            created_by: user.id,
          });
        }
      }
    }

    // Link approved bonuses for this period to the run
    const { data: runData } = await admin
      .from("payroll_runs")
      .select("period_year, period_month")
      .eq("id", input.run_id)
      .maybeSingle();
    if (runData) {
      await admin
        .from("bonuses")
        .update({ status: "paid", payroll_run_id: input.run_id, updated_by: user.id })
        .eq("status", "approved")
        .is("payroll_run_id", null)
        .eq("effective_year", runData.period_year)
        .eq("effective_month", runData.period_month);
    }

    // Notify employees with portal accounts
    const period = runData
      ? periodLabel(runData.period_year, runData.period_month)
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
      if (userIds.length) {
        await notifyUsers(userIds, {
          category: "payroll",
          type: "success",
          title: `Payslip ready — ${period}`,
          body: "Your payslip for this period is now available.",
          link: ROUTES.selfService,
        });
      }
    }
    return { ok: true };
  },
});
