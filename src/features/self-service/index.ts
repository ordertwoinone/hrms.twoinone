/**
 * Public API for the Employee Self-Service Portal.
 */
export { EssPortal } from "./components/ess-portal";
export {
  getSelfServiceData,
  resolveCurrentEmployee,
} from "./queries/self-service.queries";
export type { SelfServiceData, EssProfile } from "./types";
