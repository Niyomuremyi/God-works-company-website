"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById, ApiError } from "@/lib/api";
import { Check, ShoppingBag, Calendar, CreditCard } from "lucide-react";

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!id) return;

    getOrderById(Number(id))
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Order not found")
      );
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-5">
        <div className="bg-red-100 text-red-800 px-8 py-5 rounded-xl text-center max-w-md font-medium">
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-5">
      <div
        className={`
          max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center
          transition-all duration-700 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-18 h-18 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-200">
            <Check size={32} strokeWidth={3} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Order confirmed!
        </h1>

        <p className="text-slate-600 mb-6 leading-relaxed">
          Thank you, <strong>{order.customer_name || "Customer"}</strong>. Your
          order #{order.id} has been placed.
        </p>

        {/* Order details */}
        <div className="flex flex-wrap justify-center gap-4 py-3 border-y border-slate-100 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Calendar size={16} className="text-slate-400" />
            <span>{orderDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <CreditCard size={16} className="text-slate-400" />
            <span>
              {order.payment_method || "Credit Card"} •{" "}
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Confirmed
              </span>
            </span>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-slate-50 rounded-2xl p-5 text-left mb-6">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-200">
            <span>Item</span>
            <span>Total</span>
          </div>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-sm text-slate-800 py-2 border-b border-slate-200/60 last:border-0"
            >
              <span>
                {item.product_name}{" "}
                <span className="text-slate-400 text-xs">×{item.quantity}</span>
              </span>
              <span>${Number(item.subtotal).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 mt-1 border-t-2 border-slate-300">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          A confirmation email has been sent {" "}
          <strong>{order.customer_email}</strong>.
        </p>

        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold px-8 py-3 rounded-full text-sm shadow-md shadow-slate-200 hover:bg-slate-800 transition-colors"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </a>
      </div>
    </div>
  );
}