import type { Database } from "@/types/database.types";

type Tbl = Database["public"]["Tables"];

export type Employee = Tbl["employees"]["Row"];
export type EmployeeSalary = Tbl["employee_salaries"]["Row"];
export type EmployeeDocument = Tbl["employee_documents"]["Row"];
export type EmergencyContact = Tbl["emergency_contacts"]["Row"];
export type Dependent = Tbl["dependents"]["Row"];
export type Qualification = Tbl["qualifications"]["Row"];
export type Experience = Tbl["experiences"]["Row"];
export type EmployeeAsset = Tbl["employee_assets"]["Row"];
export type EmployeeNote = Tbl["employee_notes"]["Row"];
export type AuditLogRow = Tbl["audit_logs"]["Row"];

export type EmployeeStatus =
  | "active"
  | "probation"
  | "on_leave"
  | "inactive"
  | "terminated";

/** A row in the employees list (names resolved). */
export interface EmployeeListItem {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  fullName: string;
  photoUrl: string | null;
  workEmail: string | null;
  phone: string | null;
  departmentId: string | null;
  departmentName: string | null;
  designationName: string | null;
  branchName: string | null;
  employmentTypeName: string | null;
  status: EmployeeStatus;
  dateOfJoining: string | null;
}

export interface IdNameOption {
  id: string;
  name: string;
}

/** Options for the employee create/edit form. */
export interface EmployeeFormOptions {
  departments: IdNameOption[];
  designations: IdNameOption[];
  branches: IdNameOption[];
  employmentTypes: IdNameOption[];
  managers: IdNameOption[];
}

/** A note with its author's name resolved. */
export interface EmployeeNoteItem extends EmployeeNote {
  authorName: string | null;
}

/** Full employee profile: the record + resolved names + all related sections. */
export interface EmployeeProfile {
  employee: Employee;
  departmentName: string | null;
  designationName: string | null;
  branchName: string | null;
  employmentTypeName: string | null;
  managerName: string | null;
  documents: EmployeeDocument[];
  emergencyContacts: EmergencyContact[];
  dependents: Dependent[];
  qualifications: Qualification[];
  experiences: Experience[];
  assets: EmployeeAsset[];
  notes: EmployeeNoteItem[];
  /** Empty unless the viewer has payroll:view. */
  salaries: EmployeeSalary[];
  canViewSalary: boolean;
  canManageSalary: boolean;
}
