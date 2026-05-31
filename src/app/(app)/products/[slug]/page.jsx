"use client";

import { useState } from "react";
import ImageGallery from "@/components/ImageGallery";
import VariantSelector from "@/components/VariantSelector";
import AddToCart from "@/components/AddToCart";
import SellerCard from "@/components/SellerCard";
import Reviews from "@/components/Reviews";
import QandA from "@/components/QandA";
import Carousel from "@/components/Carousel";

const product = {
  brand: "AeroSport",
  name: "Aero Velocity Pro Runner",
  rating: 4.7,
  reviewCount: 284,
  description: "Built for speed and endurance, the Aero Velocity Pro Runner features a full-length carbon plate for explosive energy return. Engineered with a breathable mesh upper and responsive foam midsole.",
  features: [
    "Full-length carbon fibre plate",
    "Responsive ProFoam midsole",
    "Breathable engineered mesh upper",
    "Lightweight at just 198g",
    "Suitable for road and track",
  ],
};

const seller = {
  name: "AeroSport Official",
  rating: 4.9,
  followers: 12400,
  storeUrl: "#",
};

const relatedProducts = [
  {
    id: 1,
    brand: "AeroSport",
    name: "Velocity Trail X2",
    price: 110,
    rating: 4,
    image: "/product-images/shoe1.jpg",
  },
  {
    id: 2,
    brand: "StrideTech",
    name: "UltraLight 4.0",
    price: 145,
    rating: 5,
    image: "/product-images/shoe2.jpg",
  },
  {
    id: 3,
    brand: "KineticRun",
    name: "Carbon Elite Pro",
    price: 200,
    rating: 4,
    image: "/product-images/shoe3.jpg",
  },
  {
    id: 4,
    brand: "AeroSport",
    name: "Cloud Cushion 2",
    price: 95,
    rating: 4,
    image: "/product-images/shoe1.jpg",
  },
  {
    id: 5,
    brand: "PeakForm",
    name: "Speedforce V3",
    price: 130,
    rating: 5,
    image: "/product-images/shoe2.jpg",
  },
];

const alsoBought = [
  {
    id: 1,
    brand: "RunTech",
    name: "Performance Socks 3-Pack",
    price: 22,
    rating: 5,
    image: "/product-images/shoe3.jpg",
  },
  {
    id: 2,
    brand: "AeroSport",
    name: "Insole Pro Arch Support",
    price: 35,
    rating: 4,
    image: "/product-images/shoe1.jpg",
  },
  {
    id: 3,
    brand: "FitBand",
    name: "Running GPS Watch S4",
    price: 280,
    rating: 5,
    image: "/product-images/shoe2.jpg",
  },
  {
    id: 4,
    brand: "HydroRun",
    name: "Vest Pack 5L",
    price: 60,
    rating: 4,
    image: "/product-images/shoe3.jpg",
  },
  {
    id: 5,
    brand: "AeroSport",
    name: "Race Singlet V2",
    price: 45,
    rating: 5,
    image: "/product-images/shoe1.jpg",
  },
];

export default function Home() {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "auto",
        padding: "20px",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
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
              color: "#111111",
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

      {/* Product Info */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>
            {product.brand}
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111111", marginBottom: "8px" }}>
            {product.name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ color: "#f5a623" }}>{"★".repeat(Math.floor(product.rating))}{"☆".repeat(5 - Math.floor(product.rating))}</span>
            <span style={{ fontSize: "13px", color: "#888" }}>{product.rating} ({product.reviewCount} reviews)</span>
          </div>
          <p style={{ fontSize: "14px", color: "#444444", lineHeight: "1.8" }}>{product.description}</p>
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

      {/* Q&A */}
      <QandA />

      {/* Carousels */}
      <Carousel title="Related Products" products={relatedProducts} />
      <Carousel title="Customers Also Bought" products={alsoBought} />
    </div>
  );
}