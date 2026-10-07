"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ListingDetail } from "@/types";
import { getListingById, createBooking, checkoutBooking } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import {
  ChevronLeft,
  Star,
  ShieldCheck,
  CreditCard,
  Lock,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.id);

  const { currentUser, addToast } = useApp();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Dates & Guests from URL or defaults
  const qCheckIn = searchParams.get("check_in");
  const qCheckOut = searchParams.get("check_out");
  const qGuests = searchParams.get("guests");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckIn = tomorrow.toISOString().split("T")[0];

  const fourDaysLater = new Date();
  fourDaysLater.setDate(fourDaysLater.getDate() + 4);
  const defaultCheckOut = fourDaysLater.toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(qCheckIn || defaultCheckIn);
  const [checkOut, setCheckOut] = useState(qCheckOut || defaultCheckOut);
  const [guestsCount, setGuestsCount] = useState(Number(qGuests) || 1);

  // Mock Payment state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple">("card");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getListingById(listingId, currentUser?.id || 1);
        setListing(data);
      } catch (err) {
        console.error("Failed to load listing for booking", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [listingId, currentUser]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded-md w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-neutral-200 rounded-2xl" />
          <div className="h-64 bg-neutral-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-lg font-bold">Listing not found</p>
        <Link href="/" className="btn-airbnb-gradient text-white px-5 py-2 rounded-xl mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  // Calculate nights & pricing
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

  const nightlyTotal = listing.price_per_night * nights;
  const cleaningFee = listing.cleaning_fee || 50;
  const serviceFee = listing.service_fee || Math.round(nightlyTotal * 0.14);
  const totalPrice = nightlyTotal + cleaningFee + serviceFee;

  const handleConfirmBooking = async () => {
    setErrorMessage("");
    setSubmitting(true);
    try {
      const newBooking = await createBooking(
        {
          listing_id: listing.id,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestsCount,
        },
        currentUser?.id || 1
      );

      await checkoutBooking(
        newBooking.id,
        paymentMethod === "apple" ? "apple_pay" : paymentMethod,
        currentUser?.id || 1,
        paymentMethod === "card" ? cardNumber.replace(/\D/g, "").slice(-4) : undefined
      );

      addToast(`🎉 Reservation confirmed! Code: ${newBooking.booking_code}`, "success");
      router.push("/trips");
    } catch (err: any) {
      setErrorMessage(err.message || "Could not complete booking. Please verify the dates.");
      addToast(err.message || "Booking failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
      {/* Back button */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/listings/${listing.id}`}
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-800" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Request to book</h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Left Column: Trip Details & Payment */}
        <div className="md:col-span-7 space-y-8 divide-y divide-gray-200">
          {/* Trip Details */}
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Your trip</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-neutral-900">Dates</h4>
                  <p className="text-xs text-neutral-500">
                    {checkIn} – {checkOut} ({nights} nights)
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="border border-gray-300 rounded-lg p-1.5 text-xs font-medium"
                  />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="border border-gray-300 rounded-lg p-1.5 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-neutral-900">Guests</h4>
                  <p className="text-xs text-neutral-500">{guestsCount} guest{guestsCount > 1 ? "s" : ""}</p>
                </div>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg p-1.5 text-xs font-medium"
                >
                  {Array.from({ length: listing.max_guests }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} guest{i > 0 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900">Pay with</h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                <Lock className="w-3 h-3" />
                <span>Mock Encrypted</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { id: "card", label: "Credit or debit card", icon: CreditCard },
                { id: "paypal", label: "PayPal (Mock)", icon: Lock },
                { id: "apple", label: "Apple / Google Pay (Mock)", icon: Lock },
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? "border-black bg-neutral-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id as any)}
                      className="accent-black"
                    />
                    <span className="text-sm font-semibold text-neutral-800">{m.label}</span>
                  </div>
                </label>
              ))}
            </div>

            {paymentMethod === "card" && (
              <div className="border border-gray-300 rounded-2xl p-4 bg-white space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">
                    Card number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">
                      Expiration
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cancellation Policy & Rules */}
          <div className="pt-8 space-y-3 text-xs text-neutral-600">
            <h3 className="font-bold text-sm text-neutral-900">Cancellation policy</h3>
            <p>
              Free cancellation for 48 hours. Cancel before check-in for a partial refund minus the
              first night and service fee.
            </p>
            <p className="text-[11px] text-neutral-500">
              By selecting the button below, you agree to the Host's House Rules, Ground Rules for
              Guests, and Airbnb's Rebooking and Refund Policy.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="w-full py-4 rounded-xl font-bold text-white shadow-lg text-base btn-airbnb-gradient disabled:opacity-50 transition-all"
            >
              {submitting ? "Confirming Reservation..." : "Confirm and pay"}
            </button>
          </div>
        </div>

        {/* Right Column: Listing Card & Price Breakdown */}
        <div className="md:col-span-5">
          <div className="sticky top-28 border border-gray-200 rounded-3xl p-6 shadow-xl bg-white space-y-6">
            {/* Listing snippet */}
            <div className="flex gap-4 pb-6 border-b border-gray-100">
              <img
                src={listing.images?.[0]?.image_url}
                alt={listing.title}
                className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
              />
              <div className="flex flex-col justify-center">
                <span className="text-xs text-neutral-500">{listing.property_type}</span>
                <h3 className="font-bold text-sm text-neutral-900 line-clamp-2 mt-0.5">
                  {listing.title}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  <span>{listing.rating.toFixed(2)}</span>
                  <span className="text-neutral-500">({listing.review_count} reviews)</span>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div>
              <h3 className="font-bold text-base text-neutral-900 mb-4">Price details</h3>
              <div className="space-y-3 text-sm text-neutral-700 divide-y divide-gray-100">
                <div className="flex items-center justify-between">
                  <span>
                    ${listing.price_per_night} × {nights} nights
                  </span>
                  <span>${nightlyTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span>Cleaning fee</span>
                  <span>${cleaningFee}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span>Airbnb service fee</span>
                  <span>${serviceFee}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-base text-neutral-900 pt-3">
                  <span>Total (USD)</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-2xl text-[11px] text-neutral-500 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Your booking is protected by Airbnb AirCover guarantee.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
