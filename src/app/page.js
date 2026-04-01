"use client";

import { useState } from "react";
import ImageGallery from "../components/ImageGallery";
import VariantSelector from "../components/VariantSelector";
import AddToCart from "../components/AddToCart";
import SellerCard from "../components/SellerCard";
import Reviews from "../components/Reviews";

const seller = {
  name: "AeroSport Official",
  rating: 4.9,
  followers: 12400,
  storeUrl: "#",
};

export default function Home() {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      {/* Nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1>Product Page</h1>
        <div style={{ fontSize: "18px", fontWeight: "600", cursor: "pointer" }}>
          🛒{" "}
          <span
            style={{
              background: "white",
              color: "black",
              borderRadius: "50%",
              padding: "2px 8px",
              fontSize: "13px",
              marginLeft: "4px",
            }}
          >
            {cartCount}
          </span>
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery selectedVariant={selectedVariant} />

      {/* Variant Selector */}
      <VariantSelector onChange={setSelectedVariant} />

      {/* Add to Cart */}
      <AddToCart
        selectedVariant={selectedVariant}
        cartCount={cartCount}
        setCartCount={setCartCount}
      />

      {/* Seller Card */}
      <SellerCard seller={seller} />

      {/* Reviews */}
      <Reviews />
    </div>
  );
}
