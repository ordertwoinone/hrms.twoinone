/**
 * Public API for the UAE Visa Management module.
 */
export { VisaWorkspace } from "./components/visa-workspace";
export {
  getVisas,
  getVisaById,
  getVisaFormOptions,
  getVisaDashboard,
  getExpiringVisas,
} from "./queries/visas.queries";
export type {
  Visa,
  VisaStatus,
  VisaListItem,
  VisaDetail,
  VisaDashboardData,
} from "./types";
