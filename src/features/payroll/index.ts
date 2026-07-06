/**
 * Public API for the Payroll module.
 */

// ── Components ────────────────────────────────────────────────────────────────
export { PayrollDashboard } from "./components/payroll-dashboard";
export { RunsTable } from "./components/runs-table";
export { RunDetailView } from "./components/run-detail";
export { SalaryStructuresTable } from "./components/salary-structures-table";
export { ReviseSalaryDialog } from "./components/revise-salary-dialog";
export { LoansTable } from "./components/loans-table";
export { AdvancesWorkspace } from "./components/advances-workspace";
export { BonusesWorkspace } from "./components/bonuses-workspace";

// ── Queries ───────────────────────────────────────────────────────────────────
export {
  getOrgName,
  getPayrollFormOptions,
  getLoans,
  getPayrollRuns,
  getPayrollRunById,
  getPayrollDashboard,
  getAttendanceForPeriod,
  getOvertimeForPeriod,
} from "./queries/payroll.queries";
export {
  getSalaryStructures,
  getSalaryHistory,
} from "./queries/salary.queries";
export {
  getAdvances,
  computeAdvanceSummary,
  getActiveAdvancesForPayroll,
} from "./queries/advances.queries";
export {
  getBonuses,
  computeBonusSummary,
  getApprovedBonusesForPeriod,
} from "./queries/bonuses.queries";
export { getBankAccounts } from "./queries/bank-accounts.queries";

// ── Actions ───────────────────────────────────────────────────────────────────
export {
  reviseSalary,
  createLoan,
  updateLoan,
  deleteLoan,
  createPayrollRun,
  updatePayslip,
  submitPayrollRun,
  approvePayrollRun,
  cancelPayrollRun,
  markPayrollRunPaid,
} from "./actions/payroll.actions";
export {
  createAdvance,
  updateAdvance,
  approveAdvance,
  activateAdvance,
  rejectAdvance,
  cancelAdvance,
} from "./actions/advance.actions";
export {
  createBonus,
  approveBonus,
  cancelBonus,
} from "./actions/bonus.actions";
export {
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "./actions/bank-account.actions";

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  RunStatus,
  LoanStatus,
  AdvanceStatus,
  BonusStatus,
  BonusType,
  IdNameOption,
  SalaryStructureItem,
  LoanListItem,
  AdvanceListItem,
  BonusListItem,
  BankAccountItem,
  PayrollRunListItem,
  PayslipItem,
  PayrollRunDetail,
  PayrollDashboardData,
  PayrollFormOptions,
} from "./types";
