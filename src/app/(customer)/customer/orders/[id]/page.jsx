"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, CreditCard, ChevronDown, ChevronUp, RotateCcw, Star } from "lucide-react";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { TrackingTimeline } from "@/components/shared/TrackingTimeline";
import { ReturnRequestModal } from "@/components/shared/ReturnRequestModal";
import { ReviewModal } from "@/components/shared/ReviewModal";
import { formatPrice, formatDate } from "@/lib/utils";
import { getMyOrderById, getOrderItemTracking, createReturnRequest, createReview, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/shared/Toast";
import { ChatButton } from "@/components/shared/ChatButton";

function TrackableItem({ item,orderId  }) {
  const [expanded, setExpanded] = useState(false);
  const [tracking, setTracking] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [returnRequested, setReturnRequested] = useState(false);
  const [returnStatus, setReturnStatus] = useState(item.return_status);
  const [reviewSubmitted, setReviewSubmitted] = useState(item.has_review);
const toast = useToast();

  const handleToggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !tracking) {
      setLoadingTracking(true);
      try {
        const data = await getOrderItemTracking(item.id);
        setTracking(data);
      } catch {
        setTracking({ history: [], status: item.item_status });
      } finally {
        setLoadingTracking(false);
      }
    }
  };

    const handleReturnSubmit = async (itemId, reason) => {
    try {
      await createReturnRequest(itemId, reason);
      setReturnStatus("requested");
      toast("Return request submitted", { type: "success" });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to submit return request", { type: "error" });
    }
  };

  const handleReviewSubmit = async (itemId, rating, comment) => {
    try {
      await createReview(itemId, rating, comment);
      setReviewSubmitted(true);
    toast("Review submitted — thank you!", { type: "success" });
    } catch (err) {
        toast(err instanceof ApiError ? err.message : "Failed to submit review", { type: "error" });
    }
  };


  const isDelivered = item.item_status === "delivered";

  return (
    <div className="px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex gap-3 sm:gap-4">
        <div className="flex-1">
          <span className="text-sm font-medium sm:text-base">{item.product_name}</span>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
            Qty: {item.quantity} × {formatPrice(Number(item.price))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium sm:text-base">{formatPrice(Number(item.subtotal))}</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          Track package
        </button>
        
        <ChatButton orderId={orderId} itemId={item.id} label="Chat with Seller" variant="ghost" />

        {isDelivered && returnStatus === null && (
  <button type="button" onClick={() => setReturnModalOpen(true)} className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
    <RotateCcw className="h-3.5 w-3.5" />
    Request Return
  </button>
)}
        {returnStatus === "requested" && (
  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Return requested — awaiting seller review</span>
)}
{returnStatus === "approved" && (
  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Return approved</span>
)}
{returnStatus === "rejected" && (
  <span className="text-xs font-medium text-red-600 dark:text-red-400">Return rejected</span>
)}
        {isDelivered && !reviewSubmitted && (
          <button
            type="button"
            onClick={() => setReviewModalOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <Star className="h-3.5 w-3.5" />
            Leave a Review
          </button>
        )}
        {reviewSubmitted && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Review submitted</span>
        )}
      </div>

      {expanded && (
        <div className="mt-3">
          {loadingTracking ? (
            <div className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ) : (
            <TrackingTimeline
              history={tracking?.history ?? []}
              currentStatus={tracking?.status ?? item.item_status}
              estimatedDelivery={tracking?.estimatedDelivery}
              carrierNote={tracking?.carrierNote}
            />
          )}
        </div>
      )}

      {returnModalOpen && (
        <ReturnRequestModal
          item={item}
          onClose={() => setReturnModalOpen(false)}
          onSubmit={handleReturnSubmit}
        />
      )}
      {reviewModalOpen && (
        <ReviewModal
          item={item}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}

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
                <TrackableItem key={item.id} item={item} orderId={order.id}/>
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