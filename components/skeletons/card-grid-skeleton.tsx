import { Skeleton } from "@/components/ui/skeleton";

export const CardGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-3">
          <Skeleton className="aspect-video w-full rounded-md" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
};
