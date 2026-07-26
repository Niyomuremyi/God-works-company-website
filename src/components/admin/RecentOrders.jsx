"use client";

import Link from "next/link";
import { ShoppingCart, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* Hardcoded orders */
const orders = [
  {
    id: "1",
    orderNumber: "10234",
    email: "john@example.com",
    total: 120,
    status: "completed",
  },
  {
    id: "2",
    orderNumber: "10235",
    email: "sarah@example.com",
    total: 75,
    status: "pending",
  },
  {
    id: "3",
    orderNumber: "10236",
    email: "alex@example.com",
    total: 210,
    status: "cancelled",
  },
  {
    id: "4",
    orderNumber: "10237",
    email: "emma@example.com",
    total: 60,
    status: "completed",
  },
];

/* simple status map */
const statusMap = {
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

function OrderRow({ order }) {
  const status = statusMap[order.status];
  const StatusIcon = status.icon;

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          #{order.orderNumber}
        </p>

        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {order.email}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          ${order.total}
        </p>

        <Badge className={`${status.color} flex items-center gap-1`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </div>
    </Link>
  );
}

export function RecentOrders() {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <ShoppingCart className="h-6 w-6 text-zinc-400" />
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No orders yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Recent Orders
        </h2>

        <Link
          href="/admin/orders"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          View all →
        </Link>
      </div>

      {/* Orders */}
      <div className="space-y-2 p-4">
        {orders.slice(0, 5).map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}