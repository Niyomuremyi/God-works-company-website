"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function StockInput({ id, stock, onChange }) {
  const stockValue = stock ?? 0;

  const isLowStock = stockValue > 0 && stockValue <= 5;
  const isOutOfStock = stockValue === 0;

  return (
    <Input
      type="number"
      min={0}
      value={stockValue}
      onChange={(e) =>
        onChange(id, parseInt(e.target.value) || 0)
      }
      className={cn(
        "h-8 w-20 text-center",
        isOutOfStock &&
          "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
        isLowStock &&
          "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
      )}
    />
  );
}