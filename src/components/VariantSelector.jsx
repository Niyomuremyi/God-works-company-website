"use client";
import { useState } from "react";

const variants = [
  {
    color: "white",
    label: "White",
    image: "/product-images/shoe1.jpg",
    price: 120,
    sizes: [
      { size: "39", inStock: true },
      { size: "40", inStock: true },
      { size: "41", inStock: false },
      { size: "42", inStock: true },
    ],
    inStock: true,
  },
  {
    color: "dimgray",
    label: "Gray",
    image: "/product-images/shoe2.jpg",
    price: 110,
    sizes: [
      { size: "39", inStock: false },
      { size: "40", inStock: false },
      { size: "41", inStock: false },
      { size: "42", inStock: false },
    ],
    inStock: false,
  },
  {
    color: "black",
    label: "Black",
    image: "/product-images/shoe3.jpg",
    price: 130,
    sizes: [
      { size: "39", inStock: true },
      { size: "40", inStock: true },
      { size: "41", inStock: true },
      { size: "42", inStock: false },
    ],
    inStock: true,
  },
];

export default function VariantSelector({ onChange }) {
  const [selectedColor, setSelectedColor] = useState(variants[0]);
  const [selectedSize, setSelectedSize] = useState(null);

  const handleColorSelect = (variant) => {
    setSelectedColor(variant);
    setSelectedSize(null); // reset size when color changes
    onChange({ ...variant, selectedSize: null });
  };

  const handleSizeSelect = (sizeObj) => {
    if (!sizeObj.inStock) return;
    setSelectedSize(sizeObj.size);
    onChange({ ...selectedColor, selectedSize: sizeObj.size });
  };

  return (
    <div style={{ marginTop: "20px" }}>

      {/* Price */}
      <h2 style={{ marginBottom: "12px" }}>${selectedColor.price}</h2>

      {/* Color Swatches */}
      <h3 style={{ marginBottom: "8px" }}>
        Color: <span style={{ fontWeight: "normal" }}>{selectedColor.label}</span>
      </h3>
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        {variants.map((v, index) => (
          <button
            key={index}
            onClick={() => handleColorSelect(v)}
            disabled={!v.inStock}
            title={v.label}
            style={{
              width: "40px",
              height: "40px",
              background: v.color,
              border:
                selectedColor.color === v.color
                  ? "3px solid black"
                  : "1px solid gray",
              borderRadius: "50%",
              opacity: v.inStock ? 1 : 0.3,
              cursor: v.inStock ? "pointer" : "not-allowed",
            }}
          />
        ))}
      </div>

      {/* Size Grid */}
      <h3 style={{ marginBottom: "8px" }}>
        Size:{" "}
        <span style={{ fontWeight: "normal" }}>
          {selectedSize ? selectedSize : "—"}
        </span>
      </h3>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        {selectedColor.sizes.map((sizeObj, index) => (
          <button
            key={index}
            onClick={() => handleSizeSelect(sizeObj)}
            disabled={!sizeObj.inStock}
            style={{
              width: "52px",
              height: "44px",
              border:
                selectedSize === sizeObj.size
                  ? "2px solid black"
                  : "1px solid gray",
              borderRadius: "6px",
              background: selectedSize === sizeObj.size ? "black" : "white",
              color: selectedSize === sizeObj.size ? "white" : "black",
              opacity: sizeObj.inStock ? 1 : 0.3,
              cursor: sizeObj.inStock ? "pointer" : "not-allowed",
              textDecoration: sizeObj.inStock ? "none" : "line-through",
              fontWeight: "500",
            }}
          >
            {sizeObj.size}
          </button>
        ))}
      </div>

      {/* Stock Badge */}
      <div
        style={{
          display: "inline-block",
          padding: "5px 12px",
          borderRadius: "20px",
          background: selectedColor.inStock ? "#e6f4ec" : "#fde8e0",
          color: selectedColor.inStock ? "green" : "red",
          fontSize: "13px",
          fontWeight: "500",
        }}
      >
        {selectedColor.inStock ? "In Stock" : "Out of Stock"}
      </div>
    </div>
  );
}