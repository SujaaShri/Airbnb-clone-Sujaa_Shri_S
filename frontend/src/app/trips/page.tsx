"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Booking } from "@/types";
import { getMyTrips, cancelBooking } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plane,
  X,
} from "lucide-react";

export default function TripsPage() {
  const { currentUser, addToast } = useApp();
  const [trips, setTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmModalId, setConfirmModalId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getMyTrips(currentUser?.id || 1);
        setTrips(data);
      } catch (err) {
        console.error("Failed to load trips", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const handleCancel = async (bookingId: number) => {
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId, currentUser?.id || 1);
      addToast("Reservation has been cancelled and dates freed.", "info");
      // Update local trips state
      setTrips((prev) =>
        prev.map((t) => (t.id === bookingId ? { ...t, status: "cancelled" } : t))
      );
      setConfirmModalId(null);
    } catch (err: any) {
      addToast(err.message || "Failed to cancel reservation", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const activeTrips = trips.filter((t) => t.status === "confirmed");
  const pastOrCancelled = trips.filter((t) => t.status !== "confirmed");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Trips</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Review your upcoming stays, past reservations, and manage cancellations.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-neutral-200 rounded-3xl" />
          <div className="h-44 bg-neutral-200 rounded-3xl" />
        </div>
      ) : trips.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No trips booked... yet!</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Time to dust off your bags and start planning your next vacation.
          </p>
          <Link
            href="/"
            className="btn-airbnb-gradient text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md inline-block"
          >
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active / Upcoming Trips */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Upcoming Reservations ({activeTrips.length})
            </h2>

            {activeTrips.length === 0 ? (
              <p className="text-sm text-neutral-400 italic">No upcoming reservations.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTrips.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="sm:w-48 aspect-video sm:aspect-square bg-neutral-100 flex-shrink-0">
                      <img
                        src={booking.listing_image || "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80"}
                        alt={booking.listing_title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                          <span className="font-mono font-bold text-[#FF385C] bg-rose-50 px-2 py-0.5 rounded">
                            {booking.booking_code}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        </div>

                        <Link
                          href={`/listings/${booking.listing_id}`}
                          className="font-bold text-base text-neutral-900 hover:underline line-clamp-1 mt-1"
                        >
                          {booking.listing_title}
                        </Link>

                        <p className="text-xs text-neutral-500 mt-0.5">
                          {booking.listing_city}, {booking.listing_country}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-neutral-700">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>
                            {booking.check_in} → {booking.check_out} ({booking.total_nights} nights)
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {booking.guests_count} guest{booking.guests_count > 1 ? "s" : ""} • Total:{" "}
                          <span className="font-bold text-neutral-900">${booking.total_price.toLocaleString()}</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <Link
                          href={`/listings/${booking.listing_id}`}
                          className="text-xs font-semibold underline text-neutral-800"
                        >
                          View Listing
                        </Link>
                        <button
                          onClick={() => setConfirmModalId(booking.id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          Cancel stay
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past or Cancelled Trips */}
          {pastOrCancelled.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Past & Cancelled Reservations ({pastOrCancelled.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
                {pastOrCancelled.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row bg-neutral-50 rounded-3xl border border-gray-200 overflow-hidden"
                  >
                    <div className="sm:w-40 aspect-video sm:aspect-square bg-neutral-200 flex-shrink-0 grayscale">
                      <img
                        src={booking.listing_image || "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80"}
                        alt={booking.listing_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                        <span className="font-mono">{booking.booking_code}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            booking.status === "cancelled"
                              ? "bg-neutral-200 text-neutral-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-neutral-900 line-clamp-1">
                        {booking.listing_title}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {booking.check_in} to {booking.check_out}
                      </p>
                      <p className="text-xs font-semibold text-neutral-800 mt-2">
                        Total paid: ${booking.total_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {confirmModalId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-modal text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900 mb-1">Cancel this reservation?</h3>
            <p className="text-xs text-neutral-500 mb-6">
              Are you sure? Once cancelled, these dates will be immediately freed up for other guests.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmModalId(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-xs text-neutral-700 hover:bg-neutral-50"
              >
                Keep reservation
              </button>
              <button
                onClick={() => handleCancel(confirmModalId)}
                disabled={cancellingId === confirmModalId}
                className="btn-airbnb-gradient text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
              >
                {cancellingId === confirmModalId ? "Cancelling..." : "Yes, cancel stay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
