import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  confirmed: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  paid: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  processing: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  shipped: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  refunded: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function OrderStatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        style
      )}
    >
      {status}
    </span>
  );
}