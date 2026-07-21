import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";

export default function BlogsLoading() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-56" />
      <CardGridSkeleton />
    </div>
  );
}
