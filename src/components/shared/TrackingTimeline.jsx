import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered"];
const STATUS_LABELS = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};

export function TrackingTimeline({ history = [], currentStatus, estimatedDelivery, carrierNote }) {
  const isCancelled = currentStatus === "cancelled";

  const stepsWithTime = STATUS_ORDER.map((status) => {
    const event = history.find((h) => h.status === status);
    return { status, event };
  });
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      {isCancelled ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">This item was cancelled.</p>
      ) : (
        <>
          {estimatedDelivery && (
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Estimated delivery: <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatDate(estimatedDelivery, "long")}</span>
            </p>
          )}

          <ol className="space-y-4">
            {stepsWithTime.map(({ status, event }, i) => {
              const isDone = i <= currentIndex;
              return (
                <li key={status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        isDone
                          ? "bg-emerald-500 text-white"
                          : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                      )}
                    >
                      {isDone ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-2 w-2 fill-current" />}
                    </div>
                    {i < stepsWithTime.length - 1 && (
                      <div className={cn("mt-1 h-full w-px flex-1", isDone ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800")} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={cn("text-sm font-medium", isDone ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400")}>
                      {STATUS_LABELS[status]}
                    </p>
                    {event && (
                      <>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDate(event.created_at, "datetime")}
                        </p>
                        {event.note && (
                          <p className="mt-1 text-sm italic text-zinc-600 dark:text-zinc-400">"{event.note}"</p>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {carrierNote && (
            <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
              <span className="font-medium">Latest update:</span> {carrierNote}
            </div>
          )}
        </>
      )}
    </div>
  );
}