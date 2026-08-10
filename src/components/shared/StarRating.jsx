"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value = 0, onChange, readOnly = false, size = "h-5 w-5" }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-0.5" role={readOnly ? undefined : "radiogroup"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className={cn(readOnly ? "cursor-default" : "cursor-pointer")}
        >
          <Star
            className={cn(
              size,
              star <= display ? "fill-amber-400 text-amber-400" : "fill-none text-zinc-300 dark:text-zinc-600"
            )}
          />
        </button>
      ))}
    </div>
  );
}