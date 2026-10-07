"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ListingSummary } from "@/types";
import { getWishlists } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import ListingCard from "@/components/ListingCard";
import { Heart, Sparkles } from "lucide-react";

export default function WishlistsPage() {
  const { currentUser, wishlistIds } = useApp();
  const [wishlistItems, setWishlistItems] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getWishlists(currentUser?.id || 1);
        setWishlistItems(data);
      } catch (err) {
        console.error("Failed to load wishlists", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser, wishlistIds]);

  return (
    <div className="max-w-[2520px] mx-auto px-4 sm:px-8 xl:px-16 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Wishlists</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {wishlistItems.length} saved stay{wishlistItems.length === 1 ? "" : "s"} across the globe
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-neutral-200 rounded-2xl" />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 fill-[#FF385C]" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Create your first wishlist</h2>
          <p className="text-sm text-neutral-500 mb-6">
            As you search, click the heart icon on any stay to save your favorite accommodations.
          </p>
          <Link
            href="/"
            className="btn-airbnb-gradient text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md inline-block"
          >
            Explore homes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
          {wishlistItems.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      )}
    </div>
  );
}
