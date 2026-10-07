"use client";

import React, { useRef, useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Category } from "@/types";
import { getCategories } from "@/lib/api";
import {
  Sparkles,
  Waves,
  Palmtree,
  Trees,
  Castle,
  Crown,
  Building2,
  Sailboat,
  Tractor,
  Sun,
  Palette,
  Home,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Icon mapping helper
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Waves,
  Palmtree,
  Trees,
  Castle,
  Crown,
  Building2,
  Sailboat,
  Tractor,
  Sun,
  Palette,
  Home,
};

export default function CategoriesBar() {
  const {
    filters,
    setFilters,
    setIsFilterModalOpen,
    totalBeforeTaxes,
    setTotalBeforeTaxes,
  } = useApp();

  const [categories, setCategories] = useState<Category[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.warn("Could not fetch categories", err);
      }
    }
    load();
  }, []);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  // Count active filters (excluding default category)
  let activeFilterCount = 0;
  if (filters.minPrice !== null || filters.maxPrice !== null) activeFilterCount++;
  if (filters.propertyType && filters.propertyType !== "any") activeFilterCount++;
  if (filters.bedrooms !== null) activeFilterCount++;
  if (filters.amenities.length > 0) activeFilterCount += filters.amenities.length;

  return (
    <div className="sticky top-[69px] z-20 bg-white border-b border-[#EBEBEB] py-3 transition-all">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-8 xl:px-16 flex items-center justify-between gap-4">
        {/* Categories Scroll Wrapper */}
        <div className="relative flex-1 overflow-hidden flex items-center">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 z-10 w-7 h-7 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center text-neutral-700 hover:scale-105 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Categories List */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-center gap-7 overflow-x-auto hide-scrollbar scroll-smooth px-1"
          >
            {categories.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Sparkles;
              const isSelected =
                filters.category === cat.id ||
                (cat.id === "all" && (!filters.category || filters.category === "all"));

              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category: cat.id === "all" ? "all" : cat.id,
                    }))
                  }
                  className={`flex flex-col items-center gap-1.5 pb-2 transition-all flex-shrink-0 cursor-pointer select-none group border-b-2 ${
                    isSelected
                      ? "border-black text-black font-semibold"
                      : "border-transparent text-neutral-500 hover:text-black hover:border-neutral-300 font-medium"
                  }`}
                >
                  <IconComp
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 active:scale-95 ${
                      isSelected ? "scale-110 text-black stroke-[2.2]" : "text-neutral-500 group-hover:text-black"
                    }`}
                  />
                  <span className="text-xs whitespace-nowrap">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 z-10 w-7 h-7 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center text-neutral-700 hover:scale-105 transition-transform"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Button & Tax Toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 border border-[#DDDDDD] px-3.5 py-2.5 rounded-xl hover:border-black transition-colors text-xs font-semibold text-neutral-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Display Total Before Taxes Toggle */}
          <div className="hidden lg:flex items-center gap-3 border border-[#DDDDDD] px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-800">
            <span>Display total before taxes</span>
            <button
              onClick={() => setTotalBeforeTaxes(!totalBeforeTaxes)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                totalBeforeTaxes ? "bg-black" : "bg-neutral-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  totalBeforeTaxes ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
