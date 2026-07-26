"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody } from "@/components/ui/table";

import {
  ProductRow,
  ProductRowSkeleton,
  AdminSearch,
  ProductTableHeader,
} from "@/components/admin";

function ProductListContent({ products, onCreateProduct, isCreating }) {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="Try adjusting your search terms."
        action={{
          label: "Add Product",
          onClick: onCreateProduct,
          disabled: isCreating,
          icon: isCreating ? Loader2 : Plus,
        }}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <ProductTableHeader />
        <TableBody>
          {products.map((product) => (
            <ProductRow key={product.id} {...product} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <ProductTableHeader />
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <ProductRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InventoryContent() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // HARD CODED PRODUCTS
  const [products, setProducts] = useState([
    { id: "1", name: "Laptop", stock: 10, price: 1200 },
    { id: "2", name: "Keyboard", stock: 25, price: 80 },
    { id: "3", name: "Mouse", stock: 40, price: 50 },
    { id: "4", name: "Monitor", stock: 8, price: 400 },
  ]);

  // SIMPLE SEARCH FILTER
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProduct = () => {
    startTransition(() => {
      const newProduct = {
        id: crypto.randomUUID(),
        name: "New Product",
        stock: 0,
        price: 0,
      };

      setProducts((prev) => [...prev, newProduct]);

      router.push(`/admin/inventory/${newProduct.id}`);
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Manage your product stock and pricing
          </p>
        </div>

        <Button
          onClick={handleCreateProduct}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Product
        </Button>
      </div>

      {/* Search */}
      <AdminSearch
        placeholder="Search products..."
        value={searchQuery}
        onChange={setSearchQuery}
        className="w-full sm:max-w-sm"
      />

      {/* Product List */}
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductListContent
          products={filteredProducts}
          onCreateProduct={handleCreateProduct}
          isCreating={isPending}
        />
      </Suspense>
    </div>
  );
}

export default function InventoryPage() {
  return <InventoryContent />;
}