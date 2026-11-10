import { ReelGridSkeleton } from "@/components/app/states";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-8 w-full max-w-xl" />
      <ReelGridSkeleton />
    </div>
  );
}
