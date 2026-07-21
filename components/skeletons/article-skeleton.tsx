import { Skeleton } from "@/components/ui/skeleton";

export const ArticleSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white rounded-lg shadow-sm border space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="aspect-video w-full rounded-md" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
};
