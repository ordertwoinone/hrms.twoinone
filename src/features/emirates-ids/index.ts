/**
 * Public API for the Emirates ID Management module.
 */
export { EmiratesIdWorkspace } from "./components/emirates-id-workspace";
export {
  getEmiratesIds,
  getEmiratesIdById,
  getEmiratesIdFormOptions,
  getEmiratesIdDashboard,
  getExpiringEmiratesIds,
} from "./queries/emirates-ids.queries";
export type {
  EmiratesId,
  EidStatus,
  EidListItem,
  EidDetail,
  EidDashboardData,
} from "./types";
