"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ListingSummary } from "@/types";
import { useApp } from "@/context/AppContext";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";

interface ListingCardProps {
  listing: ListingSummary;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { wishlistIds, toggleWishlist, formatPrice } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    listing.images?.length > 0
      ? listing.images
      : [
          {
            image_url:
              "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
          },
        ];
  const isWishlisted = wishlistIds.has(listing.id);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listing.id);
  };

  return (
    <div className="group relative flex flex-col cursor-pointer listing-card flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px]">
      <Link href={`/listings/${listing.id}`} className="block">
        {/* Photo Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-100">
          <img
            src={images[currentImageIndex]?.image_url}
            alt={listing.title}
            className="h-full w-full object-cover listing-card-img"
          />

          {/* Guest favourite Badge */}
          {listing.is_superhost && (
            <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-neutral-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
              Guest favourite
            </div>
          )}

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleHeartClick}
            aria-label="Save to wishlist"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full transition-transform active:scale-90 hover:scale-110 focus:outline-none cursor-pointer"
          >
            <Heart
              className={`w-5 h-5 transition-colors drop-shadow-md ${
                isWishlisted
                  ? "fill-[#FF385C] text-[#FF385C]"
                  : "fill-black/25 text-white stroke-[2]"
              }`}
            />
          </button>

          {/* Carousel Arrows on Hover */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 text-neutral-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 text-neutral-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                {images.slice(0, 5).map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "w-1.5 h-1.5 bg-white scale-125"
                        : "w-1 h-1 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Card Info (Matching screenshot typography) */}
        <div className="mt-2.5 flex flex-col gap-0.5">
          <h4 className="font-semibold text-sm text-neutral-900 truncate">
            {listing.title}
          </h4>
          <p className="text-xs text-neutral-600 font-normal flex items-center gap-1">
            <span>{formatPrice(listing.price_per_night)} for 1 night</span>
            <span>·</span>
            <span className="flex items-center gap-0.5 font-medium text-neutral-800">
              <Star className="w-3 h-3 fill-black text-black inline" />
              <span>{listing.rating.toFixed(listing.rating % 1 === 0 ? 1 : 2)}</span>
            </span>
          </p>
        </div>
      </Link>
    </div>
  );
}
