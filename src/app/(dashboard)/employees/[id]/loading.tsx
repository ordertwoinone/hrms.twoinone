import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeProfileLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-10 w-full max-w-2xl rounded-lg" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
