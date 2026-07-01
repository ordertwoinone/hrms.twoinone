import "server-only";

import type { z } from "zod";

import type { ActionResult } from "@/types/common";
import type { AuthUser } from "@/types/auth";
import type { Permission } from "@/constants/permissions";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission, AuthorizationError } from "@/lib/auth/guards";
import { logger } from "@/lib/logger";

/**
 * Throw inside a handler to return a specific, user-facing error message
 * (instead of the generic fallback). Use for known, safe-to-surface failures
 * like "A user with this email already exists."
 */
export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

/**
 * `createAction` is the standard wrapper for every Server Action in the app. It
 * centralizes: auth, permission checks, Zod input validation, and error → typed
 * `ActionResult` mapping. Feature actions stay thin and focus on domain logic.
 *
 * Usage:
 *
 *   export const createEmployee = createAction({
 *     input: createEmployeeSchema,
 *     permission: PERMISSIONS.EMPLOYEE_CREATE,
 *     handler: async ({ input, user }) => { ... return employee; },
 *   });
 */
interface ActionConfig<TInput, TOutput> {
  /** Zod schema validating the raw input. Omit for no-argument actions. */
  input?: z.ZodType<TInput>;
  /** Permission(s) required to run. Omit to require only authentication. */
  permission?: Permission | Permission[];
  /** The domain logic. Receives validated input and the authorized user. */
  handler: (ctx: { input: TInput; user: AuthUser }) => Promise<TOutput>;
}

export function createAction<TInput, TOutput>(
  config: ActionConfig<TInput, TOutput>,
) {
  return async (rawInput: TInput): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Authentication / authorization.
      const user = config.permission
        ? await assertPermission(config.permission)
        : await requireAuth();

      // 2. Input validation.
      let input = rawInput;
      if (config.input) {
        const parsed = config.input.safeParse(rawInput);
        if (!parsed.success) {
          return {
            success: false,
            error: "Validation failed.",
            fieldErrors: parsed.error.flatten().fieldErrors as Record<
              string,
              string[]
            >,
          };
        }
        input = parsed.data;
      }

      // 3. Domain logic.
      const data = await config.handler({ input, user });
      return { success: true, data };
    } catch (error) {
      if (error instanceof AuthorizationError || error instanceof ActionError) {
        return { success: false, error: error.message };
      }
      logger.error("Server action failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: "Something went wrong. Please try again.",
      };
    }
  };
}
