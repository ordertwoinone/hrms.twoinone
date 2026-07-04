/**
 * Public API for the Passport Management module.
 */
export { PassportWorkspace } from "./components/passport-workspace";
export {
  getPassports,
  getPassportById,
  getPassportFormOptions,
  getPassportDashboard,
  getExpiringPassports,
} from "./queries/passports.queries";
export type {
  Passport,
  PassportStatus,
  PassportListItem,
  PassportDetail,
  PassportDashboardData,
} from "./types";
