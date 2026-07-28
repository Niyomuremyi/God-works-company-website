"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, CreditCard } from "lucide-react";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { formatPrice, formatDate } from "@/lib/utils";
import { getCustomerOrder, ApiError, getCustomerOrderById } from "@/lib/api";

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // app/(customer)/customer/orders/[id]/page.jsx
const searchParams = useSearchParams();
const email = searchParams.get("email") || "email@gmai.com";

useEffect(() => {
  if (!email) return setError("Missing email — go back and search again");
  getCustomerOrderById(email, id)
    .then(setOrder)
    .catch((err) => setError(err instanceof ApiError ? err.message : "Order not found"))
    .finally(() => setLoading(false));
}, [id, email]);

  if (loading) return <p className="text-sm text-zinc-500">Loading order...</p>;

  if (error || !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500">{error ?? "Order not found"}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={{ padding: 40 }}>
      Loading checkout...
    </div>}>
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
          <div className="rounded-xl border bg-white">
            <div className="border-b px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="font-semibold">Items ({order.items.length})</h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item._key} className="flex gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 sm:h-20 sm:w-20">
                    {item.product?.image?.asset?.url ? (
                      <Image
                        src={item.product.image.asset.url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <span className="text-sm font-medium sm:text-base">{item.product?.name}</span>
                      <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                        Qty: {item.quantity} × {formatPrice(item.priceAtPurchase)}
                      </p>
                    </div>
                    {item.product?.slug && (
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="mt-2 text-xs font-medium text-zinc-700 hover:underline w-fit"
                      >
                        Buy again
                      </Link>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium sm:text-base">
                      {formatPrice(item.priceAtPurchase * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 sm:p-6">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border bg-white p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-400" />
              <h2 className="font-semibold">Payment</h2>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {order.stripePaymentId && (
                <p className="text-xs text-zinc-500">Payment ref: {order.stripePaymentId}</p>
              )}
            </div>
          </div>

          {order.address && (
            <div className="rounded-xl border bg-white p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-zinc-400" />
                <h2 className="font-semibold">Shipping Address</h2>
              </div>
              <div className="mt-4 text-sm text-zinc-700">
                <p>{order.address.name}</p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>{order.address.city}, {order.address.postcode}</p>
                <p>{order.address.country}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-white p-4 sm:p-6">
            <p className="text-sm text-zinc-500">
              Questions about this order?{" "}
              <Link href="/support" className="font-medium text-zinc-700 hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </Suspense>
  );
}