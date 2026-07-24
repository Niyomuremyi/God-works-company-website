"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { ProductSection } from "@/components/app/ProductSection";
import { CategoryTiles } from "@/components/app/CategoryTiles";
import { FeaturedCarousel } from "@/components/app/FeaturedCarousel";
import { FeaturedCarouselSkeleton } from "@/components/app/FeaturedCarouselSkeleton";

const categories = [
  { _id: "1", name: "All", slug: "all" },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const categorySlug = "";
  const searchQuery = "";

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:4000/api/products");
        const data = await res.json();

        const mapped = data.map((p) => ({
          _id: String(p.id),
          name: p.name,
          price: Number(p.price),
          slug: p.slug,
          stock: p.stock,
          category: { title: p.seller || "General" },
          images: [
            {
              _key: `img-${p.id}`,
              asset: { url: p.image },
            },
          ],
        }));

        setProducts(mapped);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const featuredProducts = products.slice(0, 2);

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {featuredProducts.length > 0 && (
        <Suspense fallback={<FeaturedCarouselSkeleton />}>
          <FeaturedCarousel products={featuredProducts} />
        </Suspense>
      )}

      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Shop {categorySlug || "All Products"}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Premium products in your life
          </p>
        </div>

        <div className="mt-6">
          <CategoryTiles
            categories={categories}
            activeCategory={categorySlug || undefined}
          />
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