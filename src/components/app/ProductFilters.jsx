"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, Suspense } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { COLORS, MATERIALS, SORT_OPTIONS } from "@/lib/constants/filters";

export function ProductFilters({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentColor = searchParams.get("color") ?? "";
  const currentMaterial = searchParams.get("material") ?? "";
  const currentSort = searchParams.get("sort") ?? "name";
  const urlMinPrice = Number(searchParams.get("minPrice")) || 0;
  const urlMaxPrice = Number(searchParams.get("maxPrice")) || 5000;
  const currentInStock = searchParams.get("inStock") === "true";

  const [priceRange, setPriceRange] = useState([urlMinPrice, urlMaxPrice]);

  useEffect(() => {
    setPriceRange([urlMinPrice, urlMaxPrice]);
  }, [urlMinPrice, urlMaxPrice]);

  const isSearchActive = !!currentSearch;
  const isCategoryActive = !!currentCategory;
  const isColorActive = !!currentColor;
  const isMaterialActive = !!currentMaterial;
  const isPriceActive = urlMinPrice > 0 || urlMaxPrice < 5000;
  const isInStockActive = currentInStock;

  const hasActiveFilters =
    isSearchActive ||
    isCategoryActive ||
    isColorActive ||
    isMaterialActive ||
    isPriceActive ||
    isInStockActive;

  const activeFilterCount = [
    isSearchActive,
    isCategoryActive,
    isColorActive,
    isMaterialActive,
    isPriceActive,
    isInStockActive,
  ].filter(Boolean).length;

  const updateParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === 0) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("search");
    updateParams({ q: searchQuery || null });
  };

  const handleClearFilters = () => {
    router.push("/", { scroll: false });
  };

  const clearSingleFilter = (key) => {
    if (key === "price") {
      updateParams({ minPrice: null, maxPrice: null });
    } else {
      updateParams({ [key]: null });
    }
  };

  const FilterLabel = ({ children, isActive, filterKey }) => (
    <div className="mb-2 flex items-center justify-between">
      <span
        className={`block text-sm font-medium ${
          isActive
            ? "text-zinc-900 dark:text-zinc-100"
            : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {children}
        {isActive && (
          <Badge className="ml-2 h-5 bg-amber-500 px-1.5 text-xs text-white hover:bg-amber-500">
            Active
          </Badge>
        )}
      </span>
      {isActive && (
        <button
          type="button"
          onClick={() => clearSingleFilter(filterKey)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <Suspense fallback={<div style={{ padding: 40 }}>
              Loading checkout...
            </div>}>
    <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      {hasActiveFilters && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {activeFilterCount}{" "}
              {activeFilterCount === 1 ? "filter" : "filters"} applied
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleClearFilters}
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Search */}
      <div>
        <FilterLabel isActive={isSearchActive} filterKey="q">
          Search
        </FilterLabel>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            name="search"
            placeholder="Search products..."
            defaultValue={currentSearch}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Category */}
      <div>
        <FilterLabel isActive={isCategoryActive} filterKey="category">
          Category
        </FilterLabel>

        <Select
          value={currentCategory || "all"}
          onValueChange={(value) =>
            updateParams({ category: value === "all" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>

            {categories.map((category) => (
              <SelectItem key={category._id} value={category.slug}>
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div>
        <FilterLabel isActive={isColorActive} filterKey="color">
          Color
        </FilterLabel>

        <Select
          value={currentColor || "all"}
          onValueChange={(value) =>
            updateParams({ color: value === "all" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Colors" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Colors</SelectItem>

            {COLORS.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Material */}
      <div>
        <FilterLabel isActive={isMaterialActive} filterKey="material">
          Material
        </FilterLabel>

        <Select
          value={currentMaterial || "all"}
          onValueChange={(value) =>
            updateParams({ material: value === "all" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Materials" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Materials</SelectItem>

            {MATERIALS.map((material) => (
              <SelectItem key={material.value} value={material.value}>
                {material.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <FilterLabel isActive={isPriceActive} filterKey="price">
          Price Range: Frw{priceRange[0]} - Frw{priceRange[1]}
        </FilterLabel>

        <Slider
          min={0}
          max={5000}
          step={100}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value)}
          onValueCommit={([min, max]) =>
            updateParams({
              minPrice: min > 0 ? min : null,
              maxPrice: max < 5000 ? max : null,
            })
          }
        />
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={(e) =>
              updateParams({ inStock: e.target.checked ? "true" : null })
            }
          />

          <span className="text-sm font-medium">
            Show only in-stock
          </span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <span className="mb-2 block text-sm font-medium">
          Sort By
        </span>

        <Select
          value={currentSort}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    </Suspense>
  );
}