import { LoadingSpinner } from "@/components/shared/loading-spinner";

/**
 * Top-level route loading UI. Shown by Next.js Suspense while a route segment's
 * server work resolves.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
