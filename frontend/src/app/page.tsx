"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { ListingSummary } from "@/types";
import { getListings } from "@/lib/api";
import DestinationSection from "@/components/DestinationSection";
import ListingCard from "@/components/ListingCard";
import InteractiveMap from "@/components/InteractiveMap";
import FilterModal from "@/components/FilterModal";
import {
  DestinationsForYou,
  ExperiencesSection,
  ServicesSection,
} from "@/components/TabContentSections";
import { Map, List, Frown, SlidersHorizontal } from "lucide-react";

export default function HomePage() {
  const { filters, resetFilters, currentUser, setIsFilterModalOpen, headerTab } = useApp();
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getListings(filters, currentUser?.id || 1);
        setListings(data);
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters, currentUser]);

  // Check if active search or filter is applied
  const isFiltered = Boolean(
    filters.location ||
      (filters.category && filters.category !== "all") ||
      filters.checkIn ||
      filters.checkOut ||
      filters.guests > 1 ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      (filters.propertyType && filters.propertyType !== "any") ||
      filters.bedrooms !== null ||
      filters.amenities.length > 0
  );

  // Group listings by city for home destination sections
  const hyderabadListings = listings.filter(
    (l) => l.city.toLowerCase() === "hyderabad"
  );
  const coimbatoreListings = listings.filter(
    (l) => l.city.toLowerCase() === "coimbatore"
  );
  const goaListings = listings.filter(
    (l) => l.city.toLowerCase() === "goa"
  );
  const worldwideListings = listings.filter(
    (l) => !["hyderabad", "coimbatore", "goa"].includes(l.city.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Filter Modal */}
      <FilterModal />


      {/* Main Content Area */}
      <div className="max-w-[2520px] mx-auto px-4 sm:px-8 xl:px-16 pt-4">
        {loading ? (
          /* Skeletons */
          <div className="space-y-12 animate-pulse">
            <div>
              <div className="h-6 bg-neutral-200 rounded-md w-64 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="aspect-[4/3] bg-neutral-200 rounded-2xl" />
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : showMap ? (
          /* Interactive Map View */
          <div className="pt-2">
            <InteractiveMap listings={listings} />
          </div>
        ) : headerTab === "Experiences" ? (
          /* Experiences View (Always handles search on Experiences tab) */
          <div className="pt-2 animate-fade-in">
            <ExperiencesSection
              location={filters.location || undefined}
              searchQuery={filters.location || undefined}
              category={filters.category !== "all" ? filters.category : undefined}
              showFilters
            />
          </div>
        ) : headerTab === "Services" ? (
          /* Services View (Always handles search on Services tab) */
          <div className="pt-2 animate-fade-in">
            <ServicesSection
              location={filters.location || undefined}
              searchQuery={filters.location || undefined}
              category={filters.category !== "all" ? filters.category : undefined}
            />
          </div>
        ) : isFiltered ? (
          /* Filtered Search Results Grid */
          <div className="space-y-12 animate-fade-in">
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                    {filters.location
                      ? `Stays in ${filters.location}`
                      : "Search Results"}
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Showing {listings.length} places to stay
                  </p>
                </div>

                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-xl text-xs font-semibold hover:border-black transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
              </div>

              {listings.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-[#FF385C] flex items-center justify-center mb-4">
                    <Frown className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl text-neutral-900 mb-2">No exact stays found</h3>
                  <p className="text-sm text-neutral-500 mb-6">
                    Try searching for Paris, Tokyo, Dubai, Goa, Hyderabad, Coimbatore, Rome, or Bali.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="border border-black px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </div>

            {/* When on All tab with a location search, also show matching experiences & services */}
            {headerTab === "All" && filters.location && (
              <>
                <div className="pt-8 border-t border-gray-100">
                  <ExperiencesSection
                    location={filters.location}
                    searchQuery={filters.location}
                  />
                </div>
                <div className="pt-8 border-t border-gray-100">
                  <ServicesSection
                    location={filters.location}
                    searchQuery={filters.location}
                  />
                </div>
              </>
            )}
          </div>
        ) : headerTab === "Homes" ? (
          /* Homes View: Carousel "Destinations for you" + home stay sections */
          <div className="space-y-10 pt-2 animate-fade-in">
            {/* Top: Destinations for you carousel (Exclusive to Homes) */}
            <DestinationsForYou />

            {/* Section 1: Places to stay in Hyderabad */}
            {hyderabadListings.length > 0 && (
              <DestinationSection
                title="Places to stay in Hyderabad"
                listings={hyderabadListings}
                destinationQuery="Hyderabad"
              />
            )}

            {/* Section 2: Check out homes in Coimbatore */}
            {coimbatoreListings.length > 0 && (
              <DestinationSection
                title="Check out homes in Coimbatore"
                listings={coimbatoreListings}
                destinationQuery="Coimbatore"
              />
            )}

            {/* Section 3: Popular stays in Goa */}
            {goaListings.length > 0 && (
              <DestinationSection
                title="Popular stays in Goa & Beachfront"
                listings={goaListings}
                destinationQuery="Goa"
              />
            )}

            {/* Section 4: Worldwide Luxury Stays */}
            {worldwideListings.length > 0 && (
              <DestinationSection
                title="Worldwide Luxury & Iconic Stays"
                listings={worldwideListings}
              />
            )}
          </div>
        ) : (
          /* "All" Tab: Exactly matching the original classic All page */
          <div className="space-y-10 pt-2 animate-fade-in">
            {/* Section 1: Places to stay in Hyderabad */}
            {hyderabadListings.length > 0 && (
              <DestinationSection
                title="Places to stay in Hyderabad"
                listings={hyderabadListings}
                destinationQuery="Hyderabad"
              />
            )}

            {/* Section 2: Check out homes in Coimbatore */}
            {coimbatoreListings.length > 0 && (
              <DestinationSection
                title="Check out homes in Coimbatore"
                listings={coimbatoreListings}
                destinationQuery="Coimbatore"
              />
            )}

            {/* Section 3: Popular stays in Goa */}
            {goaListings.length > 0 && (
              <DestinationSection
                title="Popular stays in Goa & Beachfront"
                listings={goaListings}
                destinationQuery="Goa"
              />
            )}

            {/* Section 4: Worldwide Luxury Stays */}
            {worldwideListings.length > 0 && (
              <DestinationSection
                title="Worldwide Luxury & Iconic Stays"
                listings={worldwideListings}
              />
            )}

            {/* Experiences Highlight */}
            <div className="pt-4 border-t border-gray-100">
              <ExperiencesSection />
            </div>

            {/* Services Highlight */}
            <div className="pt-4 border-t border-gray-100">
              <ServicesSection />
            </div>
          </div>
        )}
      </div>

      {/* Floating Toggle Map / List Button (for All and Homes tabs) */}
      {(headerTab === "All" || headerTab === "Homes") && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2.5 bg-[#222222] hover:bg-black text-white px-5 py-3.5 rounded-full shadow-2xl font-semibold text-sm hover:scale-105 active:scale-95 transition-all"
          >
            {showMap ? (
              <>
                <span>Show list</span>
                <List className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Show map</span>
                <Map className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </main>
  );
}
