"use client";
import { useState } from "react";

function ProductCard({ product }) {
  return (
    <a href={`/products/${product.slug}`} style={{
      flex: "0 0 200px",
      borderRadius: "10px",
      overflow: "hidden",
      border: "1px solid #cccccc",
      background: "#ffffff",
      cursor: "pointer",
      transition: "transform 0.2s",
      textDecoration: "none",
      display: "block",
    }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
   
    {/* Image */}
      <div style={{ width: "100%", height: "180px", overflow: "hidden" }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#e5e5e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: "12px",
            }}
          >
            No image
          </div>
        )}
      </div>
     

      {/* Info */}
      <div style={{ padding: "12px" }}>
        <div style={{ fontSize: "11px", color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>
          {product.brand}
        </div>
        <div style={{ fontSize: "14px", fontWeight: "500", margin: "4px 0", color: "#111111" }}>
          {product.name}
        </div>
        <div style={{ fontSize: "15px", fontWeight: "600", color: "#111111" }}>
          ${product.price}
        </div>
        <div style={{ fontSize: "12px", color: "#f5a623", marginTop: "4px" }}>
          {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
        </div>
      </div>
    </a>
  );
}

export default function Carousel({ title, products }) {
  const [index, setIndex] = useState(0);
  const visible = 3;
  const maxIndex = Math.max(0, products.length - visible);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <div style={{ marginTop: "40px", borderTop: "1px solid #cccccc", paddingTop: "32px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", color: "#111111" }}>{title}</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={prev}
            disabled={index === 0}
            style={{
              width: "36px", height: "36px", borderRadius: "50%",
              border: "1px solid #cccccc", background: "transparent",
              color: index === 0 ? "#cccccc" : "#111111",
              fontSize: "16px", cursor: index === 0 ? "not-allowed" : "pointer",
            }}
          >
            ‹
          </button>
          <button
            onClick={next}
            disabled={index === maxIndex}
            style={{
              width: "36px", height: "36px", borderRadius: "50%",
              border: "1px solid #cccccc", background: "transparent",
              color: index === maxIndex ? "#cccccc" : "#111111",
              fontSize: "16px", cursor: index === maxIndex ? "not-allowed" : "pointer",
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ overflow: "hidden" }}>
        <div style={{
          display: "flex", gap: "16px",
          transform: `translateX(-${index * (200 + 16)}px)`,
          transition: "transform 0.4s ease",
        }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}