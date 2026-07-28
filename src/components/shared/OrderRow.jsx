"use client";

import Link from "next/link";
import { TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderStatus } from "@/lib/constants/orderStatus";
import { formatPrice, formatDate, formatOrderNumber } from "@/lib/utils";

export function OrderTableHeader({ showEmail = true }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Order</TableHead>
        {showEmail && <TableHead className="hidden sm:table-cell">Email</TableHead>}
        <TableHead className="hidden text-center md:table-cell">Items</TableHead>
        <TableHead className="hidden sm:table-cell">Total</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="hidden md:table-cell">Date</TableHead>
      </TableRow>
    </TableHeader>
  );
}

export function OrderRow({ order, basePath = "/admin/orders", showEmail = true }) {
  if (!order) return null;

  const status = getOrderStatus(order.status);
  const StatusIcon = status.icon;
  const href = `${basePath}/${order.id}`;

  return (
    <TableRow className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <TableCell className="py-3 sm:py-4">
        <Link href={href} className="block">
          <div className="flex items-center justify-between gap-2 sm:block">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              #{formatOrderNumber(order.orderNumber)}
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100 sm:hidden">
              {formatPrice(order.total)}
            </span>
          </div>
          <div className="mt-1 sm:hidden">
            {showEmail && (
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{order.email}</p>
            )}
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
              {order.createdAt && <>{" · "}{formatDate(order.createdAt, "short")}</>}
            </p>
          </div>
        </Link>
      </TableCell>

      {showEmail && (
        <TableCell className="hidden py-4 text-zinc-500 dark:text-zinc-400 sm:table-cell">
          <Link href={href} className="block truncate">{order.email}</Link>
        </TableCell>
      )}

      <TableCell className="hidden py-4 text-center md:table-cell">
        <Link href={href} className="block">{order.itemCount}</Link>
      </TableCell>

      <TableCell className="hidden py-4 font-medium text-zinc-900 dark:text-zinc-100 sm:table-cell">
        <Link href={href} className="block">{formatPrice(order.total)}</Link>
      </TableCell>

      <TableCell className="py-3 sm:py-4">
        <Link href={href} className="flex justify-center sm:justify-start">
          <Badge className={`${status.color} flex w-fit items-center gap-1 text-[10px] sm:text-xs`}>
            <StatusIcon className="h-3 w-3" />
            <span className="hidden sm:inline">{status.label}</span>
          </Badge>
        </Link>
      </TableCell>

      <TableCell className="hidden py-4 text-zinc-500 dark:text-zinc-400 md:table-cell">
        <Link href={href} className="block">{formatDate(order.createdAt, "long", "—")}</Link>
      </TableCell>
    </TableRow>
  );
}

export function OrderRowSkeleton({ showEmail = true }) {
  return (
    <TableRow>
      <TableCell className="py-3 sm:py-4">
        <div>
          <div className="flex items-center justify-between gap-2 sm:block">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14 sm:hidden" />
          </div>
          <div className="mt-1 sm:hidden">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-1 h-3 w-20" />
          </div>
        </div>
      </TableCell>
      {showEmail && (
        <TableCell className="hidden py-4 sm:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
      )}
      <TableCell className="hidden py-4 text-center md:table-cell"><Skeleton className="mx-auto h-4 w-8" /></TableCell>
      <TableCell className="hidden py-4 sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell className="py-3 sm:py-4">
        <div className="flex justify-center sm:justify-start"><Skeleton className="h-5 w-8 sm:w-20" /></div>
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
  );
}