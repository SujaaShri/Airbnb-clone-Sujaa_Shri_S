"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListingDetail, Review } from "@/types";
import { getListingById, submitReview } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import {
  Star,
  Heart,
  Share2,
  MapPin,
  ShieldCheck,
  Award,
  Key,
  Wifi,
  Waves,
  Bath,
  Utensils,
  Car,
  Wind,
  Shirt,
  Laptop,
  Flame,
  Zap,
  Palmtree,
  Sailboat,
  Mountain,
  Tv,
  Sun,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User as UserIcon,
  CheckCircle2,
} from "lucide-react";

const AMENITY_ICONS: Record<string, React.ElementType> = {
  Wifi,
  Waves,
  Bath,
  Utensils,
  Car,
  Wind,
  Shirt,
  Laptop,
  Flame,
  Zap,
  Palmtree,
  Sailboat,
  Mountain,
  Tv,
  Sun,
  Key,
};

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.id);

  const { currentUser, wishlistIds, toggleWishlist, addToast } = useApp();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Gallery Modal
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Amenities Modal
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);

  // Review Modal
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Reservation widget state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckIn = tomorrow.toISOString().split("T")[0];

  const fiveDaysLater = new Date();
  fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
  const defaultCheckOut = fiveDaysLater.toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guestsCount, setGuestsCount] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getListingById(listingId, currentUser?.id || 1);
        setListing(data);
      } catch (err) {
        console.error("Failed to load listing detail", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [listingId, currentUser]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded-md w-1/2 mb-4" />
        <div className="h-4 bg-neutral-200 rounded-md w-1/4 mb-6" />
        <div className="aspect-[16/9] w-full bg-neutral-200 rounded-3xl mb-8" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Listing not found</h2>
        <Link href="/" className="btn-airbnb-gradient text-white px-6 py-2.5 rounded-xl font-semibold">
          Back to Explore
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.has(listing.id);

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

  const nightlyTotal = listing.price_per_night * nights;
  const cleaningFee = listing.cleaning_fee || 50;
  const serviceFee = listing.service_fee || Math.round(nightlyTotal * 0.14);
  const totalPrice = nightlyTotal + cleaningFee + serviceFee;

  // Check if dates conflict with booked dates
  const isDateBooked = listing.booked_dates?.some((b) => {
    return checkIn < b.check_out && checkOut > b.check_in;
  });

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      addToast("Listing link copied to clipboard!", "info");
    }
  };

  const handleReserve = () => {
    if (isDateBooked) {
      addToast("Selected dates conflict with an existing reservation. Please pick other dates.", "error");
      return;
    }
    router.push(
      `/book/${listing.id}?check_in=${checkIn}&check_out=${checkOut}&guests=${guestsCount}`
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const addedReview = await submitReview(
        listing.id,
        {
          rating: newRating,
          cleanliness: 5.0,
          accuracy: 5.0,
          check_in_rating: 5.0,
          communication: 5.0,
          location_rating: 5.0,
          value_rating: 5.0,
          comment: newComment,
        },
        currentUser?.id || 1
      );
      // Reload listing
      const updated = await getListingById(listing.id, currentUser?.id || 1);
      setListing(updated);
      setIsReviewOpen(false);
      setNewComment("");
      addToast("Thank you! Your review was posted.", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const images = listing.images && listing.images.length > 0 ? listing.images : [];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 xl:px-12 py-6">
      {/* 1. Header Title & Actions */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
          {listing.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between text-sm text-neutral-800 gap-2">
          <div className="flex items-center gap-2 flex-wrap font-medium">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="w-4 h-4 fill-black text-black" />
              {listing.rating.toFixed(2)}
            </span>
            <span>•</span>
            <span className="underline cursor-pointer">{listing.review_count} reviews</span>
            {listing.is_superhost && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-neutral-600 font-semibold">
                  <Award className="w-4 h-4 text-[#FF385C]" />
                  Superhost
                </span>
              </>
            )}
            <span>•</span>
            <span className="underline cursor-pointer text-neutral-700">
              {listing.city}, {listing.country}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 hover:bg-neutral-100 px-3 py-2 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="underline">Share</span>
            </button>
            <button
              onClick={() => toggleWishlist(listing.id)}
              className="flex items-center gap-2 hover:bg-neutral-100 px-3 py-2 rounded-lg transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? "fill-[#FF385C] text-[#FF385C]" : "text-neutral-800"
                }`}
              />
              <span className="underline">{isWishlisted ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Photo Gallery: Classic Airbnb 5-Photo Grid */}
      <div className="relative mb-10 overflow-hidden rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[340px] sm:h-[460px]">
          {/* Main Hero Photo */}
          <div
            onClick={() => {
              setGalleryIndex(0);
              setIsGalleryOpen(true);
            }}
            className="md:col-span-2 h-full cursor-pointer overflow-hidden relative group"
          >
            <img
              src={images[0]?.image_url}
              alt="Hero view"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Grid Side Photos */}
          <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
            {images.slice(1, 5).map((img, idx) => (
              <div
                key={img.id || idx}
                onClick={() => {
                  setGalleryIndex(idx + 1);
                  setIsGalleryOpen(true);
                }}
                className="h-[225px] overflow-hidden cursor-pointer relative group"
              >
                <img
                  src={img.image_url}
                  alt={`View ${idx + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Show all photos button */}
        <button
          onClick={() => setIsGalleryOpen(true)}
          className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs hover:bg-white text-neutral-900 border border-black/80 font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>Show all {images.length} photos</span>
        </button>
      </div>

      {/* 3. Main Detail Content (2 Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left 2 Columns: Information & Features */}
        <div className="lg:col-span-2 space-y-8 divide-y divide-gray-200">
          {/* Host header */}
          <div className="flex items-center justify-between pb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {listing.property_type} hosted by {listing.host?.name}
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {listing.max_guests} guests • {listing.bedrooms} bedrooms • {listing.beds} beds • {listing.bathrooms} baths
              </p>
            </div>
            <div className="relative">
              <img
                src={listing.host?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                alt={listing.host?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
              />
              {listing.host?.is_superhost && (
                <div className="absolute -bottom-1 -right-1 bg-[#FF385C] text-white p-1 rounded-full shadow" title="Superhost">
                  <Award className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>

          {/* Highlights */}
          <div className="pt-6 pb-6 space-y-4">
            {listing.is_superhost && (
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-[#FF385C] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-neutral-900">{listing.host?.name} is a Superhost</h4>
                  <p className="text-xs text-neutral-500">Superhosts are experienced, highly rated hosts committed to great stays.</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-4">
              <Key className="w-6 h-6 text-neutral-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-neutral-900">Self check-in</h4>
                <p className="text-xs text-neutral-500">Check yourself in with the smart lock keyless entry.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CalendarIcon className="w-6 h-6 text-neutral-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-neutral-900">Free cancellation for 48 hours</h4>
                <p className="text-xs text-neutral-500">Get a full refund if you change your plans within 48 hours.</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pt-6 pb-6">
            <h3 className="font-bold text-lg text-neutral-900 mb-3">About this space</h3>
            <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="pt-6 pb-6">
            <h3 className="font-bold text-lg text-neutral-900 mb-4">What this place offers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {listing.amenities.slice(0, 10).map((amenity) => {
                const IconComponent = AMENITY_ICONS[amenity.icon] || Wifi;
                return (
                  <div key={amenity.id} className="flex items-center gap-3 text-neutral-800 text-sm">
                    <IconComponent className="w-5 h-5 text-neutral-600 flex-shrink-0" />
                    <span>{amenity.name}</span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setIsAmenitiesOpen(true)}
              className="border border-black px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm hover:bg-neutral-100 transition-colors"
            >
              Show all {listing.amenities.length} amenities
            </button>
          </div>

          {/* Availability Calendar & Blocked Dates Notice */}
          <div className="pt-6 pb-6">
            <h3 className="font-bold text-lg text-neutral-900 mb-2">Availability Calendar</h3>
            <p className="text-xs text-neutral-500 mb-4">
              {nights} nights in {listing.city}
            </p>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {listing.booked_dates && listing.booked_dates.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-neutral-700 mb-1">Blocked / Booked date ranges:</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.booked_dates.map((b, i) => (
                      <span key={i} className="text-[11px] bg-rose-100 text-[#FF385C] font-semibold px-2 py-1 rounded-md">
                        {b.check_in} to {b.check_out} (Reserved)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isDateBooked && (
                <div className="mt-3 text-xs font-bold text-[#FF385C] bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  ⚠️ Selected date range overlaps with an existing reservation. Please choose different dates.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sticky Reservation Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-3xl border border-gray-200 shadow-2xl p-6">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <span className="text-2xl font-bold text-neutral-900">${listing.price_per_night}</span>
                <span className="text-neutral-500 text-sm"> / night</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <span>{listing.rating.toFixed(2)}</span>
                <span className="text-neutral-500 font-normal">({listing.review_count})</span>
              </div>
            </div>

            {/* Date Pickers & Guests Card Input */}
            <div className="border border-gray-300 rounded-2xl overflow-hidden mb-4 divide-y divide-gray-300">
              <div className="grid grid-cols-2 divide-x divide-gray-300">
                <div className="p-2.5">
                  <span className="text-[10px] font-bold text-neutral-600 uppercase block">Check-in</span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-xs font-medium focus:outline-none bg-transparent"
                  />
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] font-bold text-neutral-600 uppercase block">Check-out</span>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full text-xs font-medium focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="p-2.5">
                <span className="text-[10px] font-bold text-neutral-600 uppercase block">Guests</span>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent cursor-pointer"
                >
                  {Array.from({ length: listing.max_guests }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reserve Button */}
            <button
              onClick={handleReserve}
              disabled={isDateBooked}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-md transition-all text-sm mb-3 ${
                isDateBooked
                  ? "bg-neutral-400 cursor-not-allowed"
                  : "btn-airbnb-gradient hover:opacity-95 active:scale-98"
              }`}
            >
              {isDateBooked ? "Dates Unavailable" : "Reserve"}
            </button>

            <p className="text-center text-xs text-neutral-500 mb-5">You won't be charged yet</p>

            {/* Price Breakdown */}
            <div className="space-y-3 text-sm text-neutral-700 divide-y divide-gray-100">
              <div className="flex items-center justify-between">
                <span className="underline">
                  ${listing.price_per_night} × {nights} nights
                </span>
                <span>${nightlyTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="underline">Cleaning fee</span>
                <span>${cleaningFee}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="underline">Airbnb service fee</span>
                <span>${serviceFee}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-base text-neutral-900 pt-3">
                <span>Total before taxes</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Reviews Section */}
      <div className="mt-16 pt-10 border-t border-gray-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
            <Star className="w-6 h-6 fill-black text-black" />
            <span>{listing.rating.toFixed(2)}</span>
            <span>•</span>
            <span>{listing.review_count} reviews</span>
          </div>

          <button
            onClick={() => setIsReviewOpen(true)}
            className="border border-black px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-100 transition-colors"
          >
            Leave a review
          </button>
        </div>

        {/* Rating Breakdown Sub-scores */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 mb-10 text-xs sm:text-sm">
          {[
            { label: "Cleanliness", score: "5.0" },
            { label: "Accuracy", score: "5.0" },
            { label: "Check-in", score: "5.0" },
            { label: "Communication", score: "5.0" },
            { label: "Location", score: "5.0" },
            { label: "Value", score: "4.9" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-neutral-700">{item.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-black rounded-full" />
                </div>
                <span className="font-semibold text-neutral-900">{item.score}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {listing.reviews && listing.reviews.length > 0 ? (
            listing.reviews.map((rev) => (
              <div key={rev.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                    alt={rev.user?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-900">{rev.user?.name}</h4>
                    <p className="text-xs text-neutral-500">
                      {new Date(rev.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-500">No reviews yet. Be the first to leave one!</p>
          )}
        </div>
      </div>

      {/* 5. Photo Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 sm:p-8 animate-fade-in">
          <div className="flex items-center justify-between text-white pb-4">
            <span className="text-sm font-semibold">
              {galleryIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="p-2 rounded-full hover:bg-neutral-800 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            <button
              onClick={() => setGalleryIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-black text-white z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <img
              src={images[galleryIndex]?.image_url}
              alt="Full view"
              className="max-h-[80vh] max-w-full object-contain rounded-2xl"
            />
            <button
              onClick={() => setGalleryIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-black text-white z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="py-2 text-center text-xs text-neutral-400">
            {images[galleryIndex]?.caption || listing.title}
          </div>
        </div>
      )}

      {/* 6. All Amenities Modal */}
      {isAmenitiesOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col p-6 shadow-2xl animate-modal">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="font-bold text-lg text-neutral-900">What this place offers</h3>
              <button onClick={() => setIsAmenitiesOpen(false)} className="p-1 rounded-full hover:bg-neutral-100">
                <X className="w-5 h-5 text-neutral-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {listing.amenities.map((amenity) => {
                const IconComponent = AMENITY_ICONS[amenity.icon] || Wifi;
                return (
                  <div key={amenity.id} className="flex items-center gap-4 text-sm text-neutral-800 pb-2 border-b border-gray-100">
                    <IconComponent className="w-5 h-5 text-neutral-600" />
                    <span className="font-medium">{amenity.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. Leave a Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-modal">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <h3 className="font-bold text-lg text-neutral-900">Leave a Review</h3>
              <button onClick={() => setIsReviewOpen(false)} className="p-1 rounded-full hover:bg-neutral-100">
                <X className="w-5 h-5 text-neutral-700" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-sm ml-2">{newRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Your feedback</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details of your stay, the host, cleanliness, and location..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-airbnb-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
                >
                  {submittingReview ? "Posting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
