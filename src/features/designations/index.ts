/**
 * Public API for the Designations module.
 */
export { DesignationsTable } from "./components/designations-table";
export {
  getDesignations,
  getDesignationDepartmentOptions,
} from "./queries/designations.queries";
export type {
  Designation,
  DesignationListItem,
  DesignationStatus,
} from "./types";
