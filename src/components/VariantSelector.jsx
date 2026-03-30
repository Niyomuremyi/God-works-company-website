"use client";
import { useState } from "react";

export default function VariantSelector({ onChange }) {
  const variants = [
    {
      color: "white",
      image: "/product-images/shoe1.jpg",
      inStock: true,
    },
    {
      color: "dimgray",
      image: "/product-images/shoe2.jpg",
      inStock: true,
    },
    {
      color: "black",
      image: "/product-images/shoe3.jpg",
      inStock: true,
    },
  ];

  const [selected, setSelected] = useState(variants[0]);

  const handleSelect = (variant) => {
    setSelected(variant);
    onChange(variant); // 👈 send data to parent
  };

  return (
    <div>
      <h3>Select Color</h3>

      {/* Color buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        {variants.map((v, index) => (
          <button
            key={index}
            onClick={() => handleSelect(v)}
            disabled={!v.inStock}
            style={{
              width: "40px",
              height: "40px",
              background: v.color,
              border:
                selected.color === v.color
                  ? "3px solid black"
                  : "1px solid gray",
              opacity: v.inStock ? 1 : 0.3,
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* Stock badge */}
      <p style={{ marginTop: "10px" }}>
        {selected.inStock ? "In Stock" : "Out of Stock"}
      </p>
    </div>
  );
}