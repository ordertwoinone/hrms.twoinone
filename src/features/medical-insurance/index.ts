/**
 * Public API for the Medical Insurance Management module.
 */
export { InsuranceWorkspace } from "./components/insurance-workspace";
export {
  getPolicies,
  getPolicyById,
  getPolicyFormOptions,
  getInsuranceDashboard,
  getExpiringPolicies,
} from "./queries/policies.queries";
export type {
  MedicalInsurance,
  PolicyStatus,
  PolicyListItem,
  PolicyDetail,
  InsuranceDashboardData,
} from "./types";
