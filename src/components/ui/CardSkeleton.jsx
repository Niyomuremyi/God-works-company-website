import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton({ lines = 4 }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="w-full space-y-2">
          <Skeleton className="h-3 w-16" />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full max-w-[80%]" />
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
    </div>
  );
}