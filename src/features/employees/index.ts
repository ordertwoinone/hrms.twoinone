/**
 * Public API for the Employees module.
 */
export { EmployeesTable } from "./components/employees-table";
export { EmployeeProfile } from "./components/employee-profile";
export {
  getEmployees,
  getEmployeeById,
  getEmployeeFormOptions,
  getEmployeeActivity,
} from "./queries/employees.queries";
export type {
  Employee,
  EmployeeListItem,
  EmployeeStatus,
  EmployeeProfile as EmployeeProfileData,
} from "./types";
