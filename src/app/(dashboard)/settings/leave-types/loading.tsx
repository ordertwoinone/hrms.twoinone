import { Skeleton } from "@/components/ui/skeleton";

export default function LeaveTypesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-20" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="rounded-lg border overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-b px-4 py-3 last:border-0">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
