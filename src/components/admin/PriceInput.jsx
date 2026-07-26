"use client";

import { Input } from "@/components/ui/input";

export function PriceInput({ id, price, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-zinc-500">Rwf</span>

      <Input
        type="number"
        min={0}
        step={0.01}
        value={price ?? 0}
        onChange={(e) =>
          onChange(id, parseFloat(e.target.value) || 0)
        }
        className="h-8 w-24 text-right"
      />
    </div>
  );
}