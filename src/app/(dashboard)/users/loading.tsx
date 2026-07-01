import { Skeleton } from "@/components/ui/skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
