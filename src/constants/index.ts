/**
 * Barrel for app-wide constants. Feature-specific constants stay inside their
 * feature folder; only cross-cutting values belong here.
 */
export * from "./routes";
export * from "./permissions";

/** App-wide pagination defaults for TanStack Table / server queries. */
export const PAGINATION = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
  maxPageSize: 100,
} as const;

/** Soft-delete sentinel: rows with a non-null `deleted_at` are excluded. */
export const SOFT_DELETE_COLUMN = "deleted_at" as const;

/** Supabase Storage bucket names. */
export const STORAGE_BUCKETS = {
  avatars: "avatars",
  documents: "documents",
  payslips: "payslips",
  company: "company",
} as const;

/** Default UAE locale settings. */
export const LOCALE = {
  timezone: "Asia/Dubai",
  currency: "AED",
  dateFormat: "dd MMM yyyy",
  dateTimeFormat: "dd MMM yyyy, HH:mm",
} as const;
