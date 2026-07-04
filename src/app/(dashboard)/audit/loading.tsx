import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-60" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Summary */}
      <Skeleton className="h-4 w-40" />

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="flex gap-6">
            {[160, 100, 110, 120, 120, 80].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: w }} />
            ))}
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="border-b px-4 py-3 last:border-0">
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28 hidden lg:block" />
              <Skeleton className="h-4 w-24 hidden xl:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
