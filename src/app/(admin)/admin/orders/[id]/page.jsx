"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { formatPrice, formatDate } from "@/lib/utils";
import { getSellerOrderById, updateOrderItemStatus, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const ITEM_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function statusBadgeClass(status) {
  switch (status) {
    case "delivered": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "shipped": return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
    case "confirmed": return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
    case "cancelled": return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";
    default: return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, ready, isLoggedIn } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn || user.role !== "seller") {
      router.push(`/login?redirect=/admin/orders/${id}`);
      return;
    }
    getSellerOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Order not found"))
      .finally(() => setLoading(false));
  }, [ready, isLoggedIn, id]);

 const handleStatusChange = async (itemId, status) => {
  const previous = order;
  setOrder((current) => ({
    ...current,
    items: current.items.map((i) => (i.id === itemId ? { ...i, item_status: status } : i)),
  }));
  try {
    const updated = await updateOrderItemStatus(itemId, status);
    setOrder((current) => ({
      ...current,
      status: updated.order_status,
      items: current.items.map((i) => (i.id === itemId ? { ...i, item_status: status } : i)),
    }));
  } catch (err) {
    setOrder(previous);
    alert(err instanceof ApiError ? err.message : "Failed to update item status");
  }
};

  if (loading) return <p className="text-sm text-zinc-500">Loading order...</p>;

  if (error || !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500">{error ?? "Order not found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(order.createdAt, "datetime")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6 sm:py-4">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Your Items ({order.items.length})
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Only items you sell are shown, even if this order has products from other sellers.
              </p>
            </div>

            <div className="divide-y dark:divide-zinc-800">
              {order.items.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.product_name}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Qty: {item.quantity} × {formatPrice(Number(item.price))}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {formatPrice(Number(item.subtotal))}
                    </p>
                    <select
                      value={item.item_status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`rounded-md border-0 px-2 py-1 text-xs font-medium ${statusBadgeClass(item.item_status)}`}
                    >
                      {ITEM_STATUSES.map((s) => (
                        <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Your Subtotal</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              This is your portion of the order only — not the customer's full order total.
            </p>
            <div className="mt-4 flex justify-between font-semibold text-zinc-900 dark:text-zinc-100">
              <span>Total</span>
              <span>{formatPrice(order.sellerSubtotal)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Customer</h2>
            </div>
            <div className="mt-4 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
              <p>{order.customerName}</p>
              <p className="break-all text-zinc-500 dark:text-zinc-400">{order.email}</p>
              {order.phone && <p className="text-zinc-500 dark:text-zinc-400">{order.phone}</p>}
            </div>
          </div>

          {order.address && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Shipping Address</h2>
              </div>
              <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">{order.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}