"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, CreditCard } from "lucide-react";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { formatPrice, formatDate } from "@/lib/utils";
import { getMyOrderById, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { ready, isLoggedIn } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn) {
      router.push(`/login?redirect=/customer/orders/${id}`);
      return;
    }
    getMyOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Order not found"))
      .finally(() => setLoading(false));
  }, [ready, isLoggedIn, id]);

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
        href="/customer/orders"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-zinc-500">{formatDate(order.createdAt, "datetime")}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-xl border bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b px-4 py-3 dark:border-zinc-800 sm:px-6 sm:py-4">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Items ({order.items?.length ?? 0})
              </h2>
            </div>
            <div className="divide-y dark:divide-zinc-800">
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="flex gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 sm:h-20 sm:w-20" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <span className="text-sm font-medium sm:text-base">{item.product_name}</span>
                      <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                        Qty: {item.quantity} × {formatPrice(Number(item.price))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium sm:text-base">
                      {formatPrice(Number(item.subtotal))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Order Summary</h2>
            <div className="mt-4 space-y-3">
              <div className="border-t pt-3 dark:border-zinc-800">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Payment</h2>
            </div>
            <p className="mt-4 text-sm capitalize text-zinc-700 dark:text-zinc-300">{order.paymentMethod}</p>
          </div>

          {order.address && (
            <div className="rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
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