"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProductDetailPage({ params }) {
  const { id } = use(params);

  const [product, setProduct] = useState({
    id,
    name: "Sample Product",
    slug: "sample-product",
    description: "",
    price: 0,
    image:"",
    seller: "",
    features: [""],
    variants: [{ color: "", size: "", stock: 0 }],
    featured: false,
    assemblyRequired: false,
  });

  const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
      setIsSaving(true);
      try {
        const res = await fetch("https://god-works-company-website-production.up.railway.app/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        });

        if (!res.ok) throw new Error("Failed to save product");

        alert("Product saved successfully!");
      } catch (err) {
        console.error(err);
        alert("Error saving product");
      } finally {
        setIsSaving(false);
      }
    };

  const updateField = (field, value) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateFeature = (index, value) => {
      setProduct((prev) => {
        const newFeatures = [...prev.features];
        newFeatures[index] = value;
        return { ...prev, features: newFeatures };
      });
      };

      const addFeature = () => {
        setProduct((prev) => ({
          ...prev,
          features: [...prev.features, ""],
        }));
      };

      const removeFeature = (index) => {
        setProduct((prev) => ({
          ...prev,
          features: prev.features.filter((_, i) => i !== index),
        }));
      };

      const updateVariant = (index, field, value) => {
        setProduct((prev) => {
          const newVariants = [...prev.variants];
          newVariants[index] = { ...newVariants[index], [field]: value };
          return { ...prev, variants: newVariants };
        });
      };

      const addVariant = () => {
        setProduct((prev) => ({
          ...prev,
          variants: [...prev.variants, { color: "", size: "", stock: 0 }],
        }));
      };

      const removeVariant = (index) => {
        setProduct((prev) => ({
          ...prev,
          variants: prev.variants.filter((_, i) => i !== index),
        }));
      };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back */}
      <Link
        href="/admin/inventory"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Inventory
      </Link>

      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              {product.name || "New Product"}
            </h1>
            <p className="text-sm text-zinc-500">Edit product details</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">

            {/* Basic Info */}
            <div className="rounded-xl border p-6">
              <h2 className="mb-4 font-semibold">Basic Information</h2>

              <div className="space-y-4">

                <div>
                  <Label>Name</Label>
                  <Input
                    value={product.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Slug</Label>
                  <Input
                    value={product.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                  />
                </div>

                <div>
                <Label>Image URL</Label>
                <Input
                  value={product.image}
                  onChange={(e) => updateField("image", e.target.value)}
                  placeholder="/product-images/example.jpg"
                />
              </div>

                <div>
                  <Label>Seller</Label>
                  <Input
                    value={product.seller}
                    onChange={(e) => updateField("seller", e.target.value)}
                    placeholder="Seller or brand name"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={product.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    rows={4}
                  />
                </div>

              </div>
            </div>
            
          {/* Features */}
            <div className="rounded-xl border p-6">
              <h2 className="mb-4 font-semibold">Features</h2>

              <div className="space-y-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="e.g. Breathable mesh upper"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addFeature}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  + Add Feature
                </button>
              </div>
            </div>

            {/* Variants */}
            <div className="rounded-xl border p-6">
              <h2 className="mb-4 font-semibold">Variants</h2>

              <div className="space-y-3">
                {product.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-center">
                    <Input
                      value={variant.color}
                      onChange={(e) => updateVariant(index, "color", e.target.value)}
                      placeholder="Color"
                    />
                    <Input
                      value={variant.size}
                      onChange={(e) => updateVariant(index, "size", e.target.value)}
                      placeholder="Size"
                    />
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", parseInt(e.target.value) || 0)
                      }
                      placeholder="Stock"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVariant}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  + Add Variant
                </button>
              </div>
            </div>
          
            {/* Pricing */}
            <div className="rounded-xl border p-6">
              <h2 className="mb-4 font-semibold">Pricing</h2>

              <div>
                <Label>Price (£)</Label>
                <Input
                  type="number"
                  value={product.price}
                  onChange={(e) =>
                    updateField("price", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            

          </div>

          {/* Save */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Product"}
          </Button>

          {/* Sidebar */}
          <div className="space-y-6">

            <div className="rounded-xl border p-6">
              <h2 className="font-semibold">View Product</h2>

              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="mt-3 inline-flex items-center gap-1 text-sm"
              >
                View on store
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}