"use client";

import Link from "next/link";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* Hardcoded products */
const lowStockProducts = [
  {
    id: "1",
    name: "Wireless Mouse",
    stock: 3,
    image: "https://picsum.photos/40?1",
  },
  {
    id: "2",
    name: "Mechanical Keyboard",
    stock: 0,
    image: "https://picsum.photos/40?2",
  },
  {
    id: "3",
    name: "USB-C Charger",
    stock: 5,
    image: "https://picsum.photos/40?3",
  },
  {
    id: "4",
    name: "Laptop Stand",
    stock: 2,
    image: "https://picsum.photos/40?4",
  },
];

function LowStockProductRow({ product }) {
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/admin/inventory/${product.id}`}
      className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 transition-colors hover:border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-700">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {product.name}
        </p>
      </div>

      <Badge
        variant={isOutOfStock ? "destructive" : "secondary"}
        className="shrink-0"
      >
        {isOutOfStock ? "Out of stock" : `${product.stock} left`}
      </Badge>
    </Link>
  );
}

export function LowStockAlert() {
  if (lowStockProducts.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            All products are well stocked!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Low Stock Alerts
        </h2>
      </div>

      {/* List */}
      <div className="space-y-2 p-4">
        {lowStockProducts.slice(0, 5).map((product) => (
          <LowStockProductRow key={product.id} product={product} />
        ))}

        {lowStockProducts.length > 5 && (
          <Link
            href="/admin/inventory?filter=low-stock"
            className="block text-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            View all {lowStockProducts.length} low stock items →
          </Link>
        )}
      </div>
    </div>
  );
}