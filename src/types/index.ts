/**
 * Barrel for shared, app-wide types. Import from `@/types` rather than reaching
 * into individual files.
 *
 * Note: `database.types.ts` is intentionally NOT re-exported here — import the
 * generated `Database` type directly from `@/types/database.types` where the
 * full generated namespace is needed.
 */
export * from "./common";
export * from "./auth";
