import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-[76px] w-full rounded-md" />
        <Skeleton className="h-[76px] w-full rounded-md" />
      </div>
      <CardGridSkeleton />
    </div>
  );
}
