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
  stock:8,
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
    slug: "velocity-trail-x2"
  },
  {
    id: 2,
    brand: "StrideTech",
    name: "UltraLight 4.0",
    price: 145,
    rating: 5,
    image: "/product-images/shoe2.jpg",
    slug: "ultralight-4"
  },
  {
    id: 3,
    brand: "KineticRun",
    name: "Carbon Elite Pro",
    price: 200,
    rating: 4,
    image: "/product-images/shoe3.jpg",
    slug: "carbon-elite-pro"
  },
  {
    id: 4,
    brand: "AeroSport",
    name: "Cloud Cushion 2",
    price: 95,
    rating: 4,
    image: "/product-images/shoe1.jpg",
    slug: "cloud-cushion-2"
  },
  {
    id: 5,
    brand: "PeakForm",
    name: "Speedforce V3",
    price: 130,
    rating: 5,
    image: "/product-images/shoe2.jpg",
    slug: "speedforce-v3"
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
    slug: "performance-socks-3-pack"
  },
  {
    id: 2,
    brand: "AeroSport",
    name: "Insole Pro Arch Support",
    price: 35,
    rating: 4,
    image: "/product-images/shoe1.jpg",
    slug: "insole-pro-arch-support"
  },
  {
    id: 3,
    brand: "FitBand",
    name: "Running GPS Watch S4",
    price: 280,
    rating: 5,
    image: "/product-images/shoe2.jpg",
    slug: "running-gps-watch-s4"
  },
  {
    id: 4,
    brand: "HydroRun",
    name: "Vest Pack 5L",
    price: 60,
    rating: 4,
    image: "/product-images/shoe3.jpg",
    slug: "vest-pack-51"
  },
  {
    id: 5,
    brand: "AeroSport",
    name: "Race Singlet V2",
    price: 45,
    rating: 5,
    image: "/product-images/shoe1.jpg",
    slug: "race-singlet-v2"
  },
];

export default function Home() {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [cartCount, setCartCount] = useState(0);

 const [copied, setCopied] = useState(false);

const handleShare = () => {
  navigator.clipboard.writeText(window.location.href);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}; 

  return (
   <div className="max-w-[900px] mx-auto p-5 bg-neutral-100 min-h-screen">
     {/* Nav */}
      <div className="flex justify-between items-center mb-6">
        <h1>Product Page</h1>
        <div className="text-lg font-semibold cursor-pointer">
          🛒{" "}
          <span className="bg-white text-neutral-900 rounded-full px-2 py-0.5 text-xs ml-1">
            {cartCount}
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="text-xs text-neutral-500 mb-4">
        <a href="/" className="text-neutral-500 no-underline">Home</a>
        <span className="mx-1.5">›</span>
        <a href="/shoes" className="text-neutral-500 no-underline">Shoes</a>
        <span className="mx-1.5">›</span>
        <span className="text-neutral-900">{product.name}</span>
      </div>

      {/* Product Info */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div className="text-xs text-neutral-500 tracking-wide uppercase">
            {product.brand}
          </div>
          <button
            onClick={handleShare}
            className="bg-transparent border border-neutral-300 rounded-lg px-3 py-1 text-xs cursor-pointer text-neutral-600"
          >
            {copied ? "✅ Link copied!" : "🔗 Share"}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          {product.name}
        </h1>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-amber-500">
            {"★".repeat(Math.floor(product.rating))}{"☆".repeat(5 - Math.floor(product.rating))}
          </span>
          <span className="text-xs text-neutral-500">{product.rating} ({product.reviewCount} reviews)</span>
        </div>

        {/* Stock */}
        <div className="mb-4">
          {product.stock > 10 ? (
            <span className="text-xs text-green-700 font-medium">✔ In Stock</span>
          ) : (
            <span className="text-xs text-orange-700 font-medium">⚠ Only {product.stock} left!</span>
          )}
        </div>

        <p className="text-sm text-neutral-700 leading-7">{product.description}</p>

        <ul className="pl-4 mt-3 flex flex-col gap-1.5 list-disc">
          {product.features.map((feature, index) => (
            <li key={index} className="text-xs text-neutral-700">
              {feature}
            </li>
          ))}
        </ul>
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