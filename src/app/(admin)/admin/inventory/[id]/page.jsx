"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MATERIALS = [
  { value: "wood", label: "Wood" },
  { value: "metal", label: "Metal" },
  { value: "fabric", label: "Fabric" },
  { value: "leather", label: "Leather" },
  { value: "glass", label: "Glass" },
];

const COLORS = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "oak", label: "Oak" },
  { value: "walnut", label: "Walnut" },
  { value: "grey", label: "Grey" },
  { value: "natural", label: "Natural" },
];

export default function ProductDetailPage({ params }) {
  const { id } = params;

  const [product, setProduct] = useState({
    id,
    name: "Sample Product",
    slug: "sample-product",
    description: "",
    price: 0,
    stock: 0,
    material: "",
    color: "",
    dimensions: "",
    featured: false,
    assemblyRequired: false,
  });

  const updateField = (field, value) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
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

            {/* Pricing */}
            <div className="rounded-xl border p-6">
              <h2 className="mb-4 font-semibold">Pricing & Inventory</h2>

              <div className="grid gap-4 sm:grid-cols-2">

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

                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={product.stock}
                    onChange={(e) =>
                      updateField("stock", parseInt(e.target.value) || 0)
                    }
                  />
                </div>

              </div>
            </div>

            {/* Attributes */}
            <div className="rounded-xl border p-6">
              <h2 className="mb-4 font-semibold">Attributes</h2>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <Label>Material</Label>
                  <Select
                    value={product.material}
                    onValueChange={(value) => updateField("material", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIALS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Color</Label>
                  <Select
                    value={product.color}
                    onValueChange={(value) => updateField("color", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <Label>Dimensions</Label>
                  <Input
                    value={product.dimensions}
                    onChange={(e) =>
                      updateField("dimensions", e.target.value)
                    }
                  />
                </div>

              </div>
            </div>

            {/* Options */}
            <div className="rounded-xl border p-6">
              <h2 className="mb-4 font-semibold">Options</h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Featured Product</p>
                  <p className="text-sm text-zinc-500">
                    Show on homepage
                  </p>
                </div>

                <Switch
                  checked={product.featured}
                  onCheckedChange={(v) => updateField("featured", v)}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Assembly Required</p>
                  <p className="text-sm text-zinc-500">
                    Customer assembles
                  </p>
                </div>

                <Switch
                  checked={product.assemblyRequired}
                  onCheckedChange={(v) =>
                    updateField("assemblyRequired", v)
                  }
                />
              </div>
            </div>

          </div>

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