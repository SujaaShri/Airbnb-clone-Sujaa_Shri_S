"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ListingSummary } from "@/types";
import { Star, X, MapPin } from "lucide-react";

interface InteractiveMapProps {
  listings: ListingSummary[];
  onClose?: () => void;
}

export default function InteractiveMap({ listings, onClose }: InteractiveMapProps) {
  const [selectedListing, setSelectedListing] = useState<ListingSummary | null>(null);

  // Approximate relative mapping for coordinates to a 1000x600 SVG projection
  // Lat: -60 to 70 -> Y: 600 to 0
  // Lng: -180 to 180 -> X: 0 to 1000
  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((85 - lat) / 170) * 100;
    return {
      left: `${Math.max(5, Math.min(95, x))}%`,
      top: `${Math.max(8, Math.min(90, y))}%`,
    };
  };

  return (
    <div className="relative w-full h-[750px] bg-[#E5E3DF] rounded-3xl overflow-hidden border border-gray-300 shadow-inner">
      {/* Map visual background with world topography vector effect */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#a3a3a3_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-gray-200 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#FF385C]" />
        <span className="text-xs font-bold text-neutral-800">
          Showing {listings.length} worldwide stays
        </span>
      </div>

      {/* Pins Layer */}
      <div className="absolute inset-0 p-8">
        {listings.map((l) => {
          const coords = getCoordinates(l.latitude, l.longitude);
          const isSelected = selectedListing?.id === l.id;

          return (
            <div
              key={l.id}
              style={{ left: coords.left, top: coords.top }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <button
                type="button"
                onClick={() => setSelectedListing(isSelected ? null : l)}
                className={`map-price-pill ${isSelected ? "active" : ""}`}
              >
                ${l.price_per_night}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Listing Popup Card */}
      {selectedListing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-modal">
          <div className="relative aspect-[16/10] w-full bg-neutral-100">
            <img
              src={selectedListing.images?.[0]?.image_url}
              alt={selectedListing.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between font-semibold text-sm text-neutral-900">
              <span className="truncate pr-2">{selectedListing.city}, {selectedListing.country}</span>
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <span>{selectedListing.rating.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500 truncate mt-0.5">{selectedListing.title}</p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="font-bold text-sm text-neutral-900">
                ${selectedListing.price_per_night} <span className="font-normal text-xs text-neutral-500">night</span>
              </span>
              <Link
                href={`/listings/${selectedListing.id}`}
                className="btn-airbnb-gradient text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
              >
                View Stay
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
