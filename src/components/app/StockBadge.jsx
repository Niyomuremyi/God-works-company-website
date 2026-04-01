"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Simple helper to check low stock
function isLowStock(stock) {
  return stock > 0 && stock <= 5; // example threshold
}

export function StockBadge({ stock, className }) {
  // Hardcode quantity in cart for now
  const quantityInCart = 0; // you can change this to test
  const isAtMax = quantityInCart >= stock && stock > 0;
  const lowStock = isLowStock(stock);

  if (isAtMax) {
    return (
      <Badge
        variant="secondary"
        className={cn("w-fit bg-blue-100 text-blue-800", className)}
      >
        Max in cart
      </Badge>
    );
  }

  if (lowStock) {
    return (
      <Badge
        variant="secondary"
        className={cn("w-fit bg-amber-100 text-amber-800", className)}
      >
        Only {stock} left in stock
      </Badge>
    );
  }

  return null;
}