"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HostStats, HostListingItem, Booking } from "@/types";
import { getHostStats, getHostListings, getHostReservations, deleteListing } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import {
  PlusCircle,
  Home,
  DollarSign,
  CalendarCheck,
  Star,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  AlertTriangle,
  Calendar,
} from "lucide-react";

export default function HostDashboardPage() {
  const { currentUser, addToast } = useApp();
  const [stats, setStats] = useState<HostStats | null>(null);
  const [listings, setListings] = useState<HostListingItem[]>([]);
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "reservations">("listings");
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const hostId = currentUser?.role === "host" ? currentUser.id : 2; // Default to host Sarah (id 2) if in guest mode

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, lData, rData] = await Promise.all([
        getHostStats(hostId),
        getHostListings(hostId),
        getHostReservations(hostId),
      ]);
      setStats(sData);
      setListings(lData);
      setReservations(rData);
    } catch (err) {
      console.error("Failed to load host data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hostId]);

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await deleteListing(id, hostId);
      addToast("Listing deleted successfully", "info");
      setListings((prev) => prev.filter((l) => l.id !== id));
      setDeleteModalId(null);
      // Reload stats
      const sData = await getHostStats(hostId);
      setStats(sData);
    } catch (err: any) {
      addToast(err.message || "Failed to delete listing", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 xl:px-12 py-10 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Host Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your properties, inspect incoming reservations, and review host earnings.
          </p>
        </div>

        <Link
          href="/host/create"
          className="btn-airbnb-gradient text-white flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Create new listing</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF385C] flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-semibold uppercase">Total Listings</p>
            <h3 className="text-2xl font-bold text-neutral-900">{stats?.total_listings ?? 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-semibold uppercase">Total Bookings</p>
            <h3 className="text-2xl font-bold text-neutral-900">{stats?.total_bookings ?? 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-semibold uppercase">Host Revenue</p>
            <h3 className="text-2xl font-bold text-neutral-900">
              ${stats?.total_revenue?.toLocaleString() ?? 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-semibold uppercase">Avg Rating</p>
            <h3 className="text-2xl font-bold text-neutral-900">
              {stats?.average_rating?.toFixed(2) ?? "5.00"}
            </h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200 mb-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "listings"
              ? "border-black text-black"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          Your Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab("reservations")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "reservations"
              ? "border-black text-black"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          Incoming Reservations ({reservations.length})
        </button>
      </div>

      {/* Tab 1: Listings Table / Cards */}
      {activeTab === "listings" && (
        <div>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-neutral-100 rounded-2xl" />
              <div className="h-20 bg-neutral-100 rounded-2xl" />
            </div>
          ) : listings.length === 0 ? (
            <div className="py-16 text-center bg-neutral-50 rounded-3xl border border-dashed border-gray-300">
              <Home className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
              <p className="font-semibold text-neutral-800">You don't have any listings yet</p>
              <Link
                href="/host/create"
                className="btn-airbnb-gradient text-white text-xs font-bold px-4 py-2 rounded-xl mt-3 inline-block"
              >
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-700">
                  <thead className="bg-neutral-50 border-b border-gray-200 text-xs text-neutral-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Property</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Nightly Price</th>
                      <th className="py-4 px-6">Rating</th>
                      <th className="py-4 px-6">Bookings</th>
                      <th className="py-4 px-6">Earned Revenue</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listings.map((l) => (
                      <tr key={l.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={l.image_url || "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=300&q=80"}
                              alt={l.title}
                              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-neutral-900 line-clamp-1">{l.title}</p>
                              <p className="text-xs text-neutral-500">
                                {l.city}, {l.country}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs font-semibold text-neutral-600">
                          {l.category}
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-900">
                          ${l.price_per_night}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 fill-black text-black" />
                            <span>{l.rating.toFixed(2)}</span>
                            <span className="text-neutral-400 font-normal">({l.review_count})</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-neutral-800">
                          {l.bookings_count}
                        </td>
                        <td className="py-4 px-6 font-bold text-emerald-600">
                          ${l.total_revenue.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/listings/${l.id}`}
                              className="p-2 text-neutral-600 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
                              title="View Stay"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/host/edit/${l.id}`}
                              className="p-2 text-neutral-600 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
                              title="Edit Listing"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteModalId(l.id)}
                              className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reservations Table */}
      {activeTab === "reservations" && (
        <div>
          {reservations.length === 0 ? (
            <div className="py-16 text-center bg-neutral-50 rounded-3xl border border-dashed border-gray-300">
              <Calendar className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
              <p className="font-semibold text-neutral-800">No guest reservations on your listings yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-700">
                  <thead className="bg-neutral-50 border-b border-gray-200 text-xs text-neutral-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Booking Code</th>
                      <th className="py-4 px-6">Property</th>
                      <th className="py-4 px-6">Guest</th>
                      <th className="py-4 px-6">Dates</th>
                      <th className="py-4 px-6">Total Payout</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reservations.map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-xs text-[#FF385C]">
                          {r.booking_code}
                        </td>
                        <td className="py-4 px-6 font-semibold text-neutral-900">
                          {r.listing_title}
                        </td>
                        <td className="py-4 px-6 font-medium text-neutral-800">
                          {r.host_name || "Guest"}
                        </td>
                        <td className="py-4 px-6 text-xs text-neutral-600">
                          {r.check_in} → {r.check_out} ({r.total_nights} nights)
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-900">
                          ${r.total_price.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              r.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-neutral-200 text-neutral-700"
                            }`}
                          >
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-modal text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900 mb-1">Delete Listing?</h3>
            <p className="text-xs text-neutral-500 mb-6">
              This action cannot be undone. All listing details and images will be permanently removed.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-xs text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModalId)}
                disabled={isDeleting}
                className="btn-airbnb-gradient text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
              >
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
