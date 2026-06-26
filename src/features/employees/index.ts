/**
 * Public API barrel for the Employees module — the ONLY surface other modules
 * may import from. Everything else under `features/employees/**` is internal.
 *
 * STRUCTURE ONLY: exports are added as the module is built. Example shape:
 *
 *   export { EmployeesTable } from "./components/employees-table";
 *   export { getEmployees } from "./queries/get-employees";
 *   export type { Employee } from "./types";
 */
export {};
