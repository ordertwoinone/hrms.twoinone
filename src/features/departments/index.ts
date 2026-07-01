/**
 * Public API for the Departments module.
 */
export { DepartmentsTable } from "./components/departments-table";
export {
  getDepartments,
  getDepartmentFormOptions,
} from "./queries/departments.queries";
export type { Department, DepartmentListItem, DepartmentStatus } from "./types";
