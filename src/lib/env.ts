import { z } from "zod";

/**
 * Type-safe environment variables.
 *
 * Validated once at module load so a misconfigured deployment fails fast with a
 * clear message instead of throwing deep inside a request. Split into:
 *  - `serverSchema`: secrets that must never reach the browser bundle.
 *  - `clientSchema`: `NEXT_PUBLIC_*` values safe to expose.
 *
 * Import `env` in server code and `clientEnv` in client components.
 */
const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  // First Super Admin bootstrap (optional). When all three are set and the
  // system has no users yet, the first Super Admin is created automatically.
  // Empty strings are tolerated (treated as "not set") so a blank value in
  // .env.local never crashes env validation.
  SUPER_ADMIN_EMAIL: z.union([z.string().email(), z.literal("")]).optional(),
  SUPER_ADMIN_PASSWORD: z.union([z.string().min(8), z.literal("")]).optional(),
  SUPER_ADMIN_NAME: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_TIMEZONE: z.string().default("Asia/Dubai"),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().default("AED"),
});

/**
 * Parse only on the server. `process.env` is statically inlined by Next.js for
 * `NEXT_PUBLIC_*` keys, so we reference them explicitly rather than spreading.
 */
function parseServerEnv() {
  const parsed = serverSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid server environment variables.");
  }

  return parsed.data;
}

const clientEnvParsed = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_DEFAULT_TIMEZONE: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE,
  NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY,
});

if (!clientEnvParsed.success) {
  console.error(
    "❌ Invalid public environment variables:",
    clientEnvParsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid public environment variables.");
}

/** Client-safe, validated env. Safe to import anywhere. */
export const clientEnv = clientEnvParsed.data;

/**
 * Server-only, validated env (includes secrets). Lazily parsed so importing
 * this module on the client does not throw on missing secrets.
 */
export const env =
  typeof window === "undefined"
    ? parseServerEnv()
    : (clientEnv as unknown as ReturnType<typeof parseServerEnv>);

export type ClientEnv = typeof clientEnv;
