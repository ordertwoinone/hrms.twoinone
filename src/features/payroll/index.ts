/**
 * Public API for the Payroll module.
 */
export { PayrollWorkspace } from "./components/payroll-workspace";
export { RunDetailView } from "./components/run-detail";
export {
  getPayrollDashboard,
  getPayrollRuns,
  getPayrollRunById,
  getSalaryStructures,
  getLoans,
  getPayrollFormOptions,
  getOrgName,
} from "./queries/payroll.queries";
export type {
  PayrollRunListItem,
  PayrollRunDetail,
  PayslipItem,
  SalaryStructureItem,
  LoanListItem,
  PayrollDashboardData,
} from "./types";
