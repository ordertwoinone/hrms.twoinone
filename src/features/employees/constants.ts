import type { EmployeeStatus } from "./types";

export const GENDERS: { value: string; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const MARITAL_STATUSES: { value: string; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

export const EMPLOYEE_STATUSES: {
  value: EmployeeStatus;
  label: string;
  variant: "success" | "warning" | "outline" | "destructive";
}[] = [
  { value: "active", label: "Active", variant: "success" },
  { value: "probation", label: "Probation", variant: "warning" },
  { value: "on_leave", label: "On Leave", variant: "warning" },
  { value: "inactive", label: "Inactive", variant: "outline" },
  { value: "terminated", label: "Terminated", variant: "destructive" },
];

export const DOCUMENT_CATEGORIES: { value: string; label: string }[] = [
  { value: "document", label: "Document" },
  { value: "attachment", label: "Attachment" },
];

export const DOCUMENT_TYPES: { value: string; label: string }[] = [
  { value: "passport", label: "Passport" },
  { value: "visa", label: "Visa" },
  { value: "emirates_id", label: "Emirates ID" },
  { value: "labour_card", label: "Labour Card" },
  { value: "contract", label: "Contract" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
];

export const RELATIONSHIPS: { value: string; label: string }[] = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
];

export const ASSET_STATUSES: { value: string; label: string }[] = [
  { value: "assigned", label: "Assigned" },
  { value: "returned", label: "Returned" },
];

export const PHOTO_MAX_BYTES = 3 * 1024 * 1024; // 3 MB
export const PHOTO_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const DOC_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
