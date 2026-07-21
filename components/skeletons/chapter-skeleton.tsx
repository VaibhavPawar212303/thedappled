import { Skeleton } from "@/components/ui/skeleton";

export const ChapterSkeleton = () => {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="aspect-video w-full rounded-md" />
      <div className="p-4 flex flex-col md:flex-row items-center justify-between space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
};
