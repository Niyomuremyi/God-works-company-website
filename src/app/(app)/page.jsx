"use client";

import { Suspense } from "react";
import { ProductSection } from "@/components/app/ProductSection";
// import { CategoryTiles } from "@/components/app/CategoryTiles";
// import { FeaturedCarousel } from "@/components/app/FeaturedCarousel";
// import { FeaturedCarouselSkeleton } from "@/components/app/FeaturedCarouselSkeleton";

// Dummy categories
const categories = [
  { id: "1", name: "Chairs", slug: "chairs" },
  { id: "2", name: "Tables", slug: "tables" },
  { id: "3", name: "Sofas", slug: "sofas" },
  { id: "4", name: "Beds", slug: "beds" },
];

// Dummy products
const products = [
  {
    id: "p1",
    name: "Modern Chair",
    price: 129.99,
    image: "/images/chair1.jpg",
    category: "chairs",
  },
  {
    id: "p2",
    name: "Wooden Table",
    price: 249.99,
    image: "/images/table1.jpg",
    category: "tables",
  },
  {
    id: "p3",
    name: "Luxury Sofa",
    price: 599.99,
    image: "/images/sofa1.jpg",
    category: "sofas",
  },
  {
    id: "p4",
    name: "Queen Bed",
    price: 399.99,
    image: "/images/bed1.jpg",
    category: "beds",
  },
];

// Dummy featured products
const featuredProducts = [
  products[0],
  products[2],
];

export default function HomePage() {
  const categorySlug = ""; // You can set a default category here
  const searchQuery = "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Featured Products Carousel */}
      {/* {featuredProducts.length > 0 && (
        <Suspense fallback={<FeaturedCarouselSkeleton />}>
          <FeaturedCarousel products={featuredProducts} />
        </Suspense>
      )} */}

      {/* Page Banner */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Shop {categorySlug || "All Products"}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Premium products in your life
          </p>
        </div>

        {/* Category Tiles */}
        <div className="mt-6">
          {/* <CategoryTiles
            categories={categories}
            activeCategory={categorySlug || undefined}
          /> */}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductSection
          categories={categories}
          products={products}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}