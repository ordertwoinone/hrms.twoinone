/**
 * Cross-cutting shared types used across features. Feature-specific types live
 * inside each feature's `types.ts`.
 */

/** Columns every table carries (audit + soft delete), per the DB brief. */
export interface BaseEntity {
  id: string; // uuid
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  deleted_at: string | null; // ISO timestamp, null = active (soft delete)
  created_by: string | null; // uuid → users.id
  updated_by: string | null; // uuid → users.id
}

/** Discriminated result type for Server Actions — never throw across the wire. */
export type ActionResult<TData = void> =
  | { success: true; data: TData }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** Standard shape for any paginated list response. */
export interface PaginatedResult<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** Parameters accepted by server-side list/query helpers. */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string | number | boolean | null>;
}

/** Generic key/value option for selects, filters, etc. */
export interface SelectOption<TValue = string> {
  label: string;
  value: TValue;
  disabled?: boolean;
}

/** Utility: make selected keys optional. */
export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/** Utility: a value that may still be loading. */
export type Nullable<T> = T | null;
