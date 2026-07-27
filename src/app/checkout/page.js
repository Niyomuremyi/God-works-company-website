"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProductBySlug, createOrder, ApiError } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = searchParams.get("slug");
  const productId = Number(searchParams.get("productId"));
  const variantId = searchParams.get("variantId")
    ? Number(searchParams.get("variantId"))
    : null;
  const qty = Number(searchParams.get("qty")) || 1;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    paymentMethod: "cod",
  });

  useEffect(() => {
    if (!slug) {
      setError("Missing product — please go back and try again.");
      setLoading(false);
      return;
    }

    getProductBySlug(slug)
      .then(setProduct)
      .catch(() => setError("Could not load this product."))
      .finally(() => setLoading(false));
  }, [slug]);

  const variant = product?.variants?.find((v) => v.id === variantId);
  const total = product ? Number(product.price) * qty : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const order = await createOrder({
        ...form,
        items: [
          {
            productId,
            variantId,
            quantity: qty,
          },
        ],
      });

      router.push(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong placing your order."
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading checkout...</div>;
  }

  if (error && !product) {
    return (
      <div style={{ padding: 40, color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        padding: 24,
      }}
    >
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        Checkout
      </h1>

      {product && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid #eee",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: 64,
              height: 64,
              objectFit: "cover",
              borderRadius: 6,
            }}
          />

          <div>
            <p style={{ fontWeight: 600 }}>{product.name}</p>

            {variant && (
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                }}
              >
                {variant.color} · {variant.size}
              </p>
            )}

            <p
              style={{
                fontSize: 13,
                color: "#666",
              }}
            >
              Qty: {qty}
            </p>

            <p
              style={{
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              ${total.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <input
          required
          placeholder="Full name"
          value={form.customerName}
          onChange={(e) =>
            setForm({
              ...form,
              customerName: e.target.value,
            })
          }
          style={inputStyle}
        />

        <input
          required
          type="email"
          placeholder="Email"
          value={form.customerEmail}
          onChange={(e) =>
            setForm({
              ...form,
              customerEmail: e.target.value,
            })
          }
          style={inputStyle}
        />

        <input
          placeholder="Phone (optional)"
          value={form.customerPhone}
          onChange={(e) =>
            setForm({
              ...form,
              customerPhone: e.target.value,
            })
          }
          style={inputStyle}
        />

        <textarea
          required
          rows={3}
          placeholder="Shipping address"
          value={form.shippingAddress}
          onChange={(e) =>
            setForm({
              ...form,
              shippingAddress: e.target.value,
            })
          }
          style={inputStyle}
        />

        <select
          value={form.paymentMethod}
          onChange={(e) =>
            setForm({
              ...form,
              paymentMethod: e.target.value,
            })
          }
          style={inputStyle}
        >
          <option value="cod">Cash on delivery</option>
          <option value="card">Card</option>
        </select>

        {error && (
          <p
            style={{
              color: "red",
              fontSize: 13,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            height: 48,
            background: "#111",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting
            ? "Placing order..."
            : `Place Order — $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 6,
  fontSize: 14,
};