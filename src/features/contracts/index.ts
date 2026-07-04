/**
 * Public API for the Contract Management module.
 */
export { ContractWorkspace } from "./components/contract-workspace";
export { ContractDetailView } from "./components/contract-detail";
export {
  getContracts,
  getContractById,
  getContractFormOptions,
  getContractDashboard,
  getExpiringContracts,
} from "./queries/contracts.queries";
export type {
  Contract,
  ContractStatus,
  ContractListItem,
  ContractDetail,
  ContractDashboardData,
} from "./types";
