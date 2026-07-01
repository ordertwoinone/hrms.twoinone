import { Skeleton } from "@/components/ui/skeleton";

export default function EmploymentTypesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-96" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
