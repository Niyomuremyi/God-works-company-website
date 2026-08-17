"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleAlert, ExternalLink, Star } from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { formatPrice } from "@/lib/utils";
import { isLowStock, isOutOfStock } from "@/lib/constants/stock";

import { StockInput } from "./StockInput";
import { PriceInput } from "./PriceInput";
import { FeaturedToggle } from "./FeaturedToggle";

 function ProductRowContent({ id, name, slug, stock, price, featured, category, image, onPriceChange, onStockChange }) {
  const lowStock = isLowStock(stock);
  const outOfStock = isOutOfStock(stock);

  return (
    <TableRow className="group">
      {/* Image Desktop */}
      <TableCell className="hidden py-3 sm:table-cell">
        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-400">
              ?
            </div>
          )}
        </div>
      </TableCell>

      {/* Name */}
      <TableCell className="py-3 sm:py-4">
        <Link
          href={`/admin/inventory/${id}`}
          className="flex items-start gap-3 sm:block"
        >
          {/* Mobile image */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 sm:hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                ?
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                {name || "Untitled Product"}
              </span>

              {featured && (
                <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400 sm:hidden" />
              )}

              {slug && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(`/products/${slug}`, "_blank");
                  }}
                  className="hidden shrink-0 opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600" />
                </button>
              )}
            </div>

            {category && (
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {category}
              </p>
            )}

            {/* Mobile stock + price */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs sm:hidden">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {formatPrice(price)}
              </span>

              <span className="text-zinc-300 dark:text-zinc-600">•</span>

              <span className="text-zinc-500 dark:text-zinc-400">
                {stock} in stock
              </span>

              {outOfStock && (
                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                  Out
                </Badge>
              )}

              {lowStock && (
                <Badge className="h-5 bg-amber-100 px-1.5 text-[10px] text-amber-800">
                  Low
                </Badge>
              )}
            </div>
          </div>
        </Link>
      </TableCell>

     {/* Price */}
      <TableCell className="hidden py-4 md:table-cell">
        <Suspense fallback={<Skeleton className="h-8 w-24" />}>
          <PriceInput id={id} price={price} onChange={onPriceChange} />
        </Suspense>
      </TableCell>

      {/* Stock */}
      <TableCell className="hidden py-4 md:table-cell">
        <div className="flex items-center gap-2">
          <Suspense fallback={<Skeleton className="h-8 w-20" />}>
            <StockInput id={id} stock={stock} onChange={onStockChange} />
          </Suspense>

          {outOfStock && (
            <Badge variant="destructive" className="text-xs">
              Out
            </Badge>
          )}

          {lowStock && (
            <Badge className="bg-amber-100 text-amber-800">
              Low
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Featured */}
      <TableCell className="hidden py-4 lg:table-cell">
        <Suspense fallback={<Skeleton className="h-8 w-8" />}>
          <FeaturedToggle id={id} featured={featured} />
        </Suspense>
      </TableCell>
    </TableRow>
  );
}

function ProductRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="hidden py-3 sm:table-cell">
        <Skeleton className="h-12 w-12 rounded-md" />
      </TableCell>

      <TableCell className="py-3 sm:py-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-md sm:hidden" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-1 h-3 w-20" />
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-8 w-24" />
      </TableCell>

      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-8 w-20" />
      </TableCell>

      <TableCell className="hidden py-4 lg:table-cell">
        <Skeleton className="h-8 w-8" />
      </TableCell>
    </TableRow>
  );
}

export function ProductRow(props) {
  return (
    <Suspense fallback={<ProductRowSkeleton />}>
      <ProductRowContent {...props} />
    </Suspense>
  );
}

export { ProductRowSkeleton };