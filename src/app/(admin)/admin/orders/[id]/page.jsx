"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ExternalLink,
} from "lucide-react";

import { formatPrice, formatDate } from "@/lib/utils";

const orders = [
  {
    id: "1",
    orderNumber: "1001",
    email: "john@example.com",
    total: 120,
    status: "paid",
    createdAt: "2026-04-07",
    stripePaymentId: "pi_123456",
    address: {
      name: "John Doe",
      line1: "123 Main Street",
      line2: null,
      city: "New York",
      postcode: "10001",
      country: "USA",
    },
    items: [
      {
        _key: "1",
        quantity: 2,
        priceAtPurchase: 30,
        product: {
          _id: "p1",
          name: "Laptop Sleeve",
          slug: "laptop-sleeve",
          image: {
            asset: {
              url: "https://picsum.photos/200",
            },
          },
        },
      },
      {
        _key: "2",
        quantity: 1,
        priceAtPurchase: 60,
        product: {
          _id: "p2",
          name: "Wireless Mouse",
          slug: "wireless-mouse",
          image: {
            asset: {
              url: "https://picsum.photos/201",
            },
          },
        },
      },
    ],
  },
];

export default function OrderDetailPage() {
  const { id } = useParams();

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Back */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            Order {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {formatDate(order.createdAt, "datetime")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">

        {/* Items */}
        <div className="space-y-6 lg:col-span-3">

          <div className="rounded-xl border bg-white">
            <div className="border-b px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="font-semibold">
                Items ({order.items.length})
              </h2>
            </div>

            <div className="divide-y">
              {order.items.map((item) => (
                <div
                  key={item._key}
                  className="flex gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4"
                >
                  {/* Image */}
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

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium sm:text-base">
                          {item.product?.name}
                        </span>

                        {item.product?.slug && (
                          <Link
                            href={`/products/${item.product.slug}`}
                            target="_blank"
                            className="text-zinc-400 hover:text-zinc-600"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                        Qty: {item.quantity} ×{" "}
                        {formatPrice(item.priceAtPurchase)}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm font-medium sm:text-base">
                      {formatPrice(
                        item.priceAtPurchase * item.quantity
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
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

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-2">

          {/* Customer */}
          <div className="rounded-xl border bg-white p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-400" />
              <h2 className="font-semibold">Customer</h2>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p className="break-all">{order.email}</p>

              {order.stripePaymentId && (
                <p className="text-xs text-zinc-500">
                  Payment: {order.stripePaymentId}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          {order.address && (
            <div className="rounded-xl border bg-white p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-zinc-400" />
                <h2 className="font-semibold">
                  Shipping Address
                </h2>
              </div>

              <div className="mt-4 text-sm text-zinc-700">
                <p>{order.address.name}</p>
                <p>{order.address.line1}</p>

                {order.address.line2 && (
                  <p>{order.address.line2}</p>
                )}

                <p>
                  {order.address.city}, {order.address.postcode}
                </p>

                <p>{order.address.country}</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}