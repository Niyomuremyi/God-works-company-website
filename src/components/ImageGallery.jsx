"use client";
import { useState, useEffect } from "react";

export default function ImageGallery({ selectedVariant }) {
  const items = [
    { type: "image", src: "/product-images/shoe1.jpg" },
    { type: "image", src: "/product-images/shoe2.jpg" },
    { type: "image", src: "/product-images/shoe3.jpg" },
  ];

  const [selected, setSelected] = useState(items[0]);

  // ✅ NEW PART
  useEffect(() => {
    if (selectedVariant) {
      setSelected({
        type: "image",
        src: selectedVariant.image,
      });
    }
  }, [selectedVariant]);

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      
      {/* Main Image */}
      <img
        src={selected.src}
        alt="product"
        style={{
          width: "100%",
          height: "400px",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      />

      {/* Thumbnails */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "10px",
          overflowX: "auto",
        }}
      >
        {items.map((item, index) => (
          <img
            key={index}
            src={item.src}
            onClick={() => setSelected(item)}
            style={{
              width: "70px",
              height: "70px",
              objectFit: "cover",
              cursor: "pointer",
              border:
                selected.src === item.src
                  ? "2px solid black"
                  : "1px solid gray",
              borderRadius: "6px",
            }}
          />
        ))}
      </div>
    </div>
  );
}