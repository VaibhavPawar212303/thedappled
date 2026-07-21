import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";

export default function BooksLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-x-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <CardGridSkeleton />
    </div>
  );
}
