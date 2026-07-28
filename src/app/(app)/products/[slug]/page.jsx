"use client";

import { useState, useEffect, use } from "react";
import ImageGallery from "@/components/ImageGallery";
import VariantSelector from "@/components/VariantSelector";
import AddToCart from "@/components/AddToCart";
import SellerCard from "@/components/SellerCard";
import Reviews from "@/components/Reviews";
import QandA from "@/components/QandA";
import Carousel from "@/components/Carousel";

export default function Home({ params }) {
  const { slug } = use(params);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [alsoBought, setAlsoBought] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("https://god-works-company-website-production.up.railway.app/api/products") ;
        const data = await res.json();

        const current = data.find((p) => p.slug === slug);
        const others = data.filter((p) => p.slug !== slug);

        setProduct(current);
        setRelatedProducts(others.slice(0, 5));
        setAlsoBought(others.slice(5, 10));
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-5">Loading...</div>;
  if (!product) return <div className="p-5">Product not found</div>;

  return (
    <div className="max-w-[900px] mx-auto p-5 bg-neutral-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1>Product Page</h1>
        <div className="text-lg font-semibold cursor-pointer">
          🛒{" "}
          <span className="bg-white text-neutral-900 rounded-full px-2 py-0.5 text-xs ml-1">
            {cartCount}
          </span>
        </div>
      </div>

      <div className="text-xs text-neutral-500 mb-4">
        <a href="/" className="text-neutral-500 no-underline">Home</a>
        <span className="mx-1.5">›</span>
        <a href="/shoes" className="text-neutral-500 no-underline">Shoes</a>
        <span className="mx-1.5">›</span>
        <span className="text-neutral-900">{product.name}</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div className="text-xs text-neutral-500 tracking-wide uppercase">
            {product.seller}
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

        <div className="mb-4">
          {product.stock > 10 ? (
            <span className="text-xs text-green-700 font-medium">✔ In Stock</span>
          ) : (
            <span className="text-xs text-orange-700 font-medium">⚠ Only {product.stock} left!</span>
          )}
        </div>

        <p className="text-sm text-neutral-700 leading-7">{product.description}</p>

        <ul className="pl-4 mt-3 flex flex-col gap-1.5 list-disc">
          {(product.features || []).map((feature, index) => (
            <li key={index} className="text-xs text-neutral-700">
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <ImageGallery selectedVariant={selectedVariant} />
     <VariantSelector variants={product.variants || []} price={product.price} onChange={setSelectedVariant} />
      <AddToCart
      productId={product.id}
      productSlug={product.slug}
      selectedVariant={selectedVariant}
      cartCount={cartCount}
      setCartCount={setCartCount}
      />
      <SellerCard seller={{ name: product.seller, rating: 0, followers: 0 }} />
      <Reviews />
      <QandA />
      <Carousel title="Related Products" products={relatedProducts} />
      <Carousel title="Customers Also Bought" products={alsoBought} />
    </div>
  );
}
