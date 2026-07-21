import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 gap-6">
      <Skeleton className="h-8 w-64 rounded-full" />
      <Skeleton className="h-16 w-full max-w-3xl" />
      <Skeleton className="h-16 w-2/3 max-w-2xl" />
      <Skeleton className="h-6 w-full max-w-xl" />
      <div className="flex gap-4">
        <Skeleton className="h-14 w-48 rounded-full" />
        <Skeleton className="h-14 w-40 rounded-full" />
      </div>
    </div>
  );
}
