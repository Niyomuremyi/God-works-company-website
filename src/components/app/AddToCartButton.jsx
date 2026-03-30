"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

export function AddToCartButton({ name, stock, className }) {
  const [quantityInCart, setQuantityInCart] = React.useState(0);

  const isOutOfStock = stock <= 0;
  const isAtMax = quantityInCart >= stock;

  const handleAdd = () => {
    if (quantityInCart < stock) {
      setQuantityInCart(quantityInCart + 1);
      toast.success(`Added ${name}`);
    }
  };

  const handleDecrement = () => {
    if (quantityInCart > 0) {
      setQuantityInCart(quantityInCart - 1);
    }
  };

  // Out of stock
  if (isOutOfStock) {
    return (
      <Button
        disabled
        variant="secondary"
        className={cn("h-11 w-full", className)}
      >
        Out of Stock
      </Button>
    );
  }

  // Not in cart - show Add to Basket button
  if (quantityInCart === 0) {
    return (
      <Button onClick={handleAdd} className={cn("h-11 w-full", className)}>
        <ShoppingBag className="mr-2 h-4 w-4" />
        Add to Basket
      </Button>
    );
  }

  // In cart - show quantity controls
  return (
    <div
      className={cn(
        "flex h-11 w-full items-center rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-full flex-1 rounded-r-none"
        onClick={handleDecrement}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="flex-1 text-center text-sm font-semibold tabular-nums">
        {quantityInCart}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-full flex-1 rounded-l-none disabled:opacity-20"
        onClick={handleAdd}
        disabled={isAtMax}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}