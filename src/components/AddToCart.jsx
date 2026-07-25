"use client";
import { useState, useEffect } from "react";

export default function AddToCart({ selectedVariant, cartCount, setCartCount }) {
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  // Show sticky bar only when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    setCartCount((prev) => prev + qty);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <div style={{ marginTop: "20px", paddingBottom: "80px" }}>

      {/* Quantity Stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <span style={{ fontWeight: "500", color:"#111111" }}>Quantity:</span>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid gray", borderRadius: "6px", overflow: "hidden", background: "#ffffff" }}>
          <button
            onClick={() => setQty((prev) => Math.max(1, prev - 1))}
            style={{ width: "36px", height: "36px", background: "none", border: "none", fontSize: "18px", cursor: "pointer", color:"#111111" }}
          >
            −
          </button>
          <span style={{ width: "36px", textAlign: "center", fontWeight: "500", color:"#111111" }}>{qty}</span>
          <button
            onClick={() => setQty((prev) => Math.min(10, prev + 1))}
            style={{ width: "36px", height: "36px", background: "none", border: "none", fontSize: "18px", cursor: "pointer", color:"#111111" }}
          >
            +
          </button>
        </div>
      </div>

      {/* Main Buttons */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant}
          style={{
            flex: 1, height: "48px",
            background: selectedVariant ? "#111111" : "#555555",
            color: "white", border: "none",
            borderRadius: "8px", fontSize: "14px",
            fontWeight: "600", cursor: selectedVariant ? "pointer" : "not-allowed",
            letterSpacing: "1px",
          }}
        >
          Add to Cart
        </button>
        <button
          disabled={!selectedVariant}
          style={{
            flex: 1, height: "48px",
            background: selectedVariant ? "#ff6b00" : "#cc4400",
            color: "white", border: "none",
            borderRadius: "8px", fontSize: "14px",
            fontWeight: "600", cursor: selectedVariant ? "pointer" : "not-allowed",
            letterSpacing: "1px",
          }}
        >
          Buy Now
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", left: "50%",
          transform: "translateX(-50%)",
          background: "#1a1a1a", color: "white",
          padding: "12px 24px", borderRadius: "8px",
          fontSize: "14px", fontWeight: "500",
          zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}>
          ✅ Added to cart!
        </div>
      )}

      {/* Sticky Mobile Buy Bar — only on mobile + only on scroll */}
      <style>{`
        .sticky-bar {
          display: none;
        }
        @media (max-width: 768px) {
          .sticky-bar {
            display: flex;
          }
        }
      `}</style>

      {showSticky && (
        <div
          className="sticky-bar"
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            background: "white", borderTop: "1px solid #eee",
            padding: "12px 16px",
            gap: "12px", zIndex: 999,
            boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            style={{
              flex: 1, height: "46px",
              background: selectedVariant ? "#111111" : "#555555",
              color: "white", border: "none",
              borderRadius: "8px", fontSize: "13px",
              fontWeight: "600", cursor: selectedVariant ? "pointer" : "not-allowed",
            }}
          >
            Add to Cart
          </button>
          <button
            disabled={!selectedVariant}
            style={{
              flex: 1, height: "46px",
              background: selectedVariant ? "#ff6b00" : "#cc4400",
              color: "white", border: "none",
              borderRadius: "8px", fontSize: "13px",
              fontWeight: "600", cursor: selectedVariant ? "pointer" : "not-allowed",
            }}
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
}