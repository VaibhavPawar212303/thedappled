import { Skeleton } from "@/components/ui/skeleton";

export const CourseShellSkeleton = () => {
  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50 border-b flex items-center px-4">
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50 border-r p-4 space-y-3">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <main className="md:pl-80 h-full pt-24">
        <div className="p-4 space-y-4">
          <Skeleton className="aspect-video w-full rounded-md" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </main>
    </div>
  );
};
