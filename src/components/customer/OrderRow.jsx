import Link from "next/link";
import { Eye } from "lucide-react";
import { TableRow, TableCell, TableHead, TableHeader } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { formatPrice, formatDate } from "@/lib/utils";

export function CustomerOrderTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Order</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Items</TableHead>
        <TableHead>Total</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Details</TableHead>
      </TableRow>
    </TableHeader>
  );
}

export function CustomerOrderRow({ order }) {
  return (
    <TableRow>
      <TableCell className="font-medium">#{order.id}</TableCell>
      <TableCell className="text-zinc-500">{formatDate(order.date)}</TableCell>
      <TableCell>{order.items}</TableCell>
      <TableCell>{formatPrice(order.total)}</TableCell>
      <TableCell>
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell className="text-right">
        <Link
          href={`/customer/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>
      </TableCell>
    </TableRow>
  );
}

export function CustomerOrderRowSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );
}