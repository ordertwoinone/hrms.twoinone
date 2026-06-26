import { z } from "zod";

import { PAGINATION } from "@/constants";

/**
 * Reusable Zod primitives shared by every feature's schemas. Compose these
 * rather than re-declaring the same rules per module.
 */
export const uuidSchema = z.string().uuid("Invalid identifier.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.");

/** UAE mobile format: +9715XXXXXXXX or 05XXXXXXXX. */
export const uaePhoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+9715\d{8}|05\d{8})$/, "Enter a valid UAE phone number.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[0-9]/, "Include at least one number.");

/** Standard list-query params used by server-side paginated endpoints. */
export const queryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.maxPageSize)
    .default(PAGINATION.defaultPageSize),
  search: z.string().trim().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type QueryParamsInput = z.infer<typeof queryParamsSchema>;
