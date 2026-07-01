import { z } from "zod";

import { emailSchema, passwordSchema, uuidSchema } from "@/lib/validations";
import { ROLE_ORDER, type Role } from "@/config/roles";

/** Role key constrained to the known system roles. */
const roleKeySchema = z.enum(ROLE_ORDER as unknown as [Role, ...Role[]]);

/** UAE phone, optional. Validated only when provided. */
const optionalUaePhone = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || /^(?:\+9715\d{8}|05\d{8})$/.test(value),
    "Enter a valid UAE phone number.",
  );

const nameSchema = z.string().trim().min(2, "Enter a full name.").max(120);

export const createUserSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  roleKey: roleKeySchema,
  phone: optionalUaePhone,
  password: passwordSchema,
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  id: uuidSchema,
  fullName: nameSchema,
  roleKey: roleKeySchema,
  phone: optionalUaePhone,
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const setUserStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(["active", "inactive"]),
});
export type SetUserStatusInput = z.infer<typeof setUserStatusSchema>;

export const resetUserPasswordSchema = z.object({
  id: uuidSchema,
});
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;
