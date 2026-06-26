/**
 * Supabase-generated database types.
 *
 * ⚠️ PLACEHOLDER — this file is auto-generated once the schema exists. Run:
 *
 *     npm run db:types
 *
 * (which calls `supabase gen types typescript --linked`) to overwrite it with
 * the real, fully-typed schema. Until then this minimal shape keeps the
 * Supabase clients strongly typed and the project compiling.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
