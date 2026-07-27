"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById, ApiError } from "@/lib/api";

export default function OrderConfirmationPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    getOrderById(Number(id))
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Order not found")
      );
  }, [id]);

  if (error) {
    return <div style={{ padding: 40, color: "red" }}>{error}</div>;
  }

  if (!order) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "60px auto",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        Order placed!
      </h1>

      <p style={{ color: "#666", marginBottom: 24 }}>
        Order #{order.id} — a confirmation was sent to{" "}
        {order.customer_email}
      </p>

      <div
        style={{
          textAlign: "left",
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 16,
        }}
      >
        {order.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              marginBottom: 6,
            }}
          >
            <span>
              {item.product_name} × {item.quantity}
            </span>

            <span>
              ${Number(item.subtotal).toFixed(2)}
            </span>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid #eee",
          }}
        >
          <span>Total</span>

          <span>
            ${Number(order.total_amount).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}