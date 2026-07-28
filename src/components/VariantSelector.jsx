"use client";
import { useState, useEffect } from "react";

export default function VariantSelector({ variants = [], price, onChange }) {
  const uniqueColors = [...new Set(variants.map((v) => v.color))];

  const [selectedColor, setSelectedColor] = useState(uniqueColors[0] || null);
  const [selectedSize, setSelectedSize] = useState(null);

  const sizesForColor = variants.filter((v) => v.color === selectedColor);
  const selectedVariant = sizesForColor.find((v) => v.size === selectedSize) || null;
  const colorInStock = sizesForColor.some((v) => v.stock > 0);

  useEffect(() => {
    setSelectedSize(null);
    onChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (variant) => {
    if (variant.stock <= 0) return;
    setSelectedSize(variant.size);
    onChange(variant);
  };

  if (variants.length === 0) {
    return <p style={{ color: "#666" }}>No variants available for this product.</p>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Price */}
      <h2 style={{ marginBottom: "12px", color: "#111111" }}>${price}</h2>

      {/* Color Swatches */}
      <h3 style={{ marginBottom: "8px", color: "#111111" }}>
        Color: <span style={{ fontWeight: "normal", color: "#444444" }}>{selectedColor}</span>
      </h3>
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        {uniqueColors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleColorSelect(color)}
            title={color}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              border: selectedColor === color ? "2px solid black" : "1px solid gray",
              borderRadius: "20px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: color,
                border: "1px solid #ccc",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: "12px", color: "#111111" }}>{color}</span>
          </button>
        ))}
      </div>

      {/* Size Grid */}
      <h3 style={{ marginBottom: "8px", color: "#111111" }}>
        Size: <span style={{ fontWeight: "normal" }}>{selectedSize || "—"}</span>
      </h3>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        {sizesForColor.map((variant, index) => (
          <button
            key={index}
            onClick={() => handleSizeSelect(variant)}
            disabled={variant.stock <= 0}
            style={{
              width: "52px",
              height: "44px",
              border: selectedSize === variant.size ? "2px solid black" : "1px solid gray",
              borderRadius: "6px",
              background: selectedSize === variant.size ? "black" : "white",
              color: selectedSize === variant.size ? "white" : "black",
              opacity: variant.stock > 0 ? 1 : 0.3,
              cursor: variant.stock > 0 ? "pointer" : "not-allowed",
              textDecoration: variant.stock > 0 ? "none" : "line-through",
              fontWeight: "500",
            }}
          >
            {variant.size}
          </button>
        ))}
      </div>

      {/* Stock Badge */}
      <div
        style={{
          display: "inline-block",
          padding: "5px 12px",
          borderRadius: "20px",
          background: colorInStock ? "#e6f4ec" : "#fde8e0",
          color: colorInStock ? "green" : "red",
          fontSize: "13px",
          fontWeight: "500",
        }}
      >
        {colorInStock ? "In Stock" : "Out of Stock"}
      </div>
    </div>
  );
}