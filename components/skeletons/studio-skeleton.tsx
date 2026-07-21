import { Skeleton } from "@/components/ui/skeleton";

export const StudioSkeleton = () => {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Skeleton className="h-8 w-72" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    </div>
  );
};
