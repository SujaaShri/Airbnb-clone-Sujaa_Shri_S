"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ListingSummary } from "@/types";
import ListingCard from "./ListingCard";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";

interface DestinationSectionProps {
  title: string;
  listings: ListingSummary[];
  destinationQuery?: string;
}

export default function DestinationSection({
  title,
  listings,
  destinationQuery,
}: DestinationSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -560 : 560;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [listings]);

  if (listings.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        {/* Title with Right Arrow */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            {title}
          </h2>
          <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-neutral-200 transition-colors">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-neutral-700 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Previous stays"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-neutral-700 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Next stays"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-2"
      >
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
