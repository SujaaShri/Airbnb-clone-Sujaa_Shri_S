"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Amenity } from "@/types";
import { getAmenities } from "@/lib/api";
import { X, Check } from "lucide-react";

export default function FilterModal() {
  const { filters, setFilters, isFilterModalOpen, setIsFilterModalOpen, resetFilters } = useApp();

  const [minPrice, setMinPrice] = useState<number | string>(filters.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState<number | string>(filters.maxPrice ?? "");
  const [propertyType, setPropertyType] = useState<string>(filters.propertyType || "any");
  const [bedrooms, setBedrooms] = useState<number | null>(filters.bedrooms);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(filters.amenities || []);
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const list = await getAmenities();
        setAllAmenities(list);
      } catch {
        // quiet fallback
      }
    }
    load();
  }, []);

  // Sync internal state when modal opens
  useEffect(() => {
    if (isFilterModalOpen) {
      setMinPrice(filters.minPrice ?? "");
      setMaxPrice(filters.maxPrice ?? "");
      setPropertyType(filters.propertyType || "any");
      setBedrooms(filters.bedrooms);
      setSelectedAmenities(filters.amenities || []);
    }
  }, [isFilterModalOpen, filters]);

  if (!isFilterModalOpen) return null;

  const toggleAmenity = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    setFilters((prev) => ({
      ...prev,
      minPrice: minPrice !== "" ? Number(minPrice) : null,
      maxPrice: maxPrice !== "" ? Number(maxPrice) : null,
      propertyType,
      bedrooms,
      amenities: selectedAmenities,
    }));
    setIsFilterModalOpen(false);
  };

  const handleClearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("any");
    setBedrooms(null);
    setSelectedAmenities([]);
    resetFilters();
    setIsFilterModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-800" />
          </button>
          <h2 className="font-bold text-base text-neutral-900">Filters</h2>
          <div className="w-6" /> {/* spacer */}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7 divide-y divide-gray-100">
          {/* Price Range */}
          <div>
            <h3 className="font-bold text-lg text-neutral-900 mb-1">Price range</h3>
            <p className="text-xs text-neutral-500 mb-4">Nightly prices before taxes and fees</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 border border-gray-300 rounded-2xl p-3 focus-within:border-black transition-colors">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Minimum</span>
                <div className="flex items-center text-sm font-semibold">
                  <span className="mr-1 text-neutral-600">$</span>
                  <input
                    type="number"
                    placeholder="50"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full focus:outline-none bg-transparent"
                  />
                </div>
              </div>
              <span className="text-neutral-400 font-bold">—</span>
              <div className="flex-1 border border-gray-300 rounded-2xl p-3 focus-within:border-black transition-colors">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Maximum</span>
                <div className="flex items-center text-sm font-semibold">
                  <span className="mr-1 text-neutral-600">$</span>
                  <input
                    type="number"
                    placeholder="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Type of Place */}
          <div className="pt-6">
            <h3 className="font-bold text-lg text-neutral-900 mb-3">Type of place</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "any", label: "Any type" },
                { id: "Entire place", label: "Entire place" },
                { id: "Room", label: "Private room" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPropertyType(t.id)}
                  className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    propertyType === t.id
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-black text-neutral-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div className="pt-6">
            <h3 className="font-bold text-lg text-neutral-900 mb-3">Bedrooms</h3>
            <div className="flex items-center gap-2 overflow-x-auto">
              {[null, 1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num === null ? "any" : num}
                  onClick={() => setBedrooms(num)}
                  className={`px-5 py-2.5 rounded-full border text-xs font-semibold flex-shrink-0 transition-all ${
                    bedrooms === num
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black text-neutral-800"
                  }`}
                >
                  {num === null ? "Any" : `${num}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="pt-6">
            <h3 className="font-bold text-lg text-neutral-900 mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {allAmenities.map((amenity) => {
                const checked = selectedAmenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      checked
                        ? "border-black bg-neutral-50 text-neutral-900 font-semibold"
                        : "border-gray-200 hover:border-gray-400 text-neutral-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        checked ? "bg-black border-black text-white" : "border-gray-300 bg-white"
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span>{amenity.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleClearAll}
            className="text-sm font-semibold underline text-neutral-800 hover:text-black transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="btn-airbnb-gradient text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md"
          >
            Show places
          </button>
        </div>
      </div>
    </div>
  );
}
