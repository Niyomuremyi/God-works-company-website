"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FeaturedToggle({ id, featured, onToggle }) {
  const isFeatured = featured;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => onToggle(id)}
      title={isFeatured ? "Remove from featured" : "Add to featured"}
    >
      <Star
        className={cn(
          "h-4 w-4 transition-colors",
          isFeatured
            ? "fill-amber-400 text-amber-400"
            : "text-zinc-300 dark:text-zinc-600"
        )}
      />
    </Button>
  );
}