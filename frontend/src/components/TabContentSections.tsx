"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Heart, Star, ArrowRight, Clock, Users, Globe, X, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getExperiences, getServices } from "@/lib/api";
import { Experience, Service } from "@/types";
import ExperienceFilters, { ExperienceBrowseFilters } from "@/components/ExperienceFilters";

export const DESTINATIONS_DATA = [
  {
    id: "dubai",
    name: "Dubai",
    subtitle: "Prime beach & skyline spot",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    query: "Dubai",
  },
  {
    id: "kuala_lumpur",
    name: "Kuala Lumpur",
    subtitle: "For the Petronas Towers",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80",
    query: "Kuala Lumpur",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    subtitle: "Vibrant nightlife & temples",
    img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
    query: "Bangkok",
  },
  {
    id: "nyc",
    name: "New York City",
    subtitle: "Epic skyline & culture",
    img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    query: "New York",
  },
  {
    id: "paris",
    name: "Paris",
    subtitle: "Iconic romance & cafes",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    query: "Paris",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    subtitle: "World-class dining & lights",
    img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    query: "Tokyo",
  },
  {
    id: "london",
    name: "London",
    subtitle: "Historic charm & theatre",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    query: "London",
  },
  {
    id: "singapore",
    name: "Singapore",
    subtitle: "Gardens & modern luxury",
    img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
    query: "Singapore",
  },
  {
    id: "rome",
    name: "Rome",
    subtitle: "Ancient history & gelato",
    img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    query: "Rome",
  },
  {
    id: "barcelona",
    name: "Barcelona",
    subtitle: "Gothic alleys & beach life",
    img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
    query: "Barcelona",
  },
];

export function DestinationsForYou() {
  const { setFilters } = useApp();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Destinations for you
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Popular global hotspots with outstanding places to stay
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black hover:scale-105 transition-all text-neutral-700 bg-white cursor-pointer"
            aria-label="Previous destinations"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black hover:scale-105 transition-all text-neutral-700 bg-white cursor-pointer"
            aria-label="Next destinations"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-start gap-4 overflow-x-auto hide-scrollbar scroll-smooth py-1"
      >
        {DESTINATIONS_DATA.map((dest) => (
          <button
            key={dest.id}
            onClick={() => setFilters((prev) => ({ ...prev, location: dest.query }))}
            className="flex-shrink-0 w-32 sm:w-36 flex flex-col text-left group cursor-pointer transition-transform hover:-translate-y-1"
          >
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-neutral-100 mb-2.5 shadow-sm group-hover:shadow-md transition-shadow relative">
              <img
                src={dest.img}
                alt={dest.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="font-semibold text-xs sm:text-sm text-neutral-900 leading-tight group-hover:underline">
              {dest.name}
            </p>
            <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1 mt-0.5">
              {dest.subtitle}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------- EXPERIENCES SECTION -----------------
interface ExperiencesSectionProps {
  location?: string;
  searchQuery?: string;
  category?: string;
  showFilters?: boolean;
}

export function ExperiencesSection({ location, searchQuery, category, showFilters = false }: ExperiencesSectionProps = {}) {
  const { formatPrice, addToast, setFilters } = useApp();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [browseFilters, setBrowseFilters] = useState<ExperienceBrowseFilters>({
    originals: false,
    featured: [],
    types: [],
    goodFor: [],
    times: [],
    languages: [],
    accessibility: [],
    minPrice: null,
    maxPrice: null,
    maxDuration: 6,
  });
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await getExperiences({
          location: location || undefined,
          search: searchQuery || undefined,
          category: category || undefined,
        });
        if (isMounted) {
          setExperiences(data);
        }
      } catch (err) {
        console.error("Failed to fetch experiences:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [location, searchQuery, category]);

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikes((prev) => {
      const next = !prev[id];
      if (next) {
        addToast("Added experience to your favorites!", "success");
      } else {
        addToast("Removed experience from favorites", "info");
      }
      return { ...prev, [id]: next };
    });
  };

  const handleBookExperience = (exp: Experience) => {
    addToast(`Booked: "${exp.title}" for ₹${exp.price_per_person.toLocaleString()}!`, "success");
    setSelectedExp(null);
  };

  const filteredExperiences = experiences.filter((experience) => {
    if (browseFilters.originals && !experience.is_original) return false;
    if (browseFilters.minPrice !== null && experience.price_per_person < browseFilters.minPrice) return false;
    if (browseFilters.maxPrice !== null && experience.price_per_person > browseFilters.maxPrice) return false;
    if (browseFilters.maxDuration < 6 && experience.duration_hours > browseFilters.maxDuration) return false;
    if (browseFilters.languages.length > 0 &&
      !browseFilters.languages.some((language) => experience.language.toLowerCase().includes(language.toLowerCase()))) {
      return false;
    }
    if (browseFilters.accessibility.length > 0) return false;
    if (browseFilters.goodFor.includes("Big groups") && experience.group_size < 10) return false;
    if (browseFilters.goodFor.includes("Going solo") && experience.group_size > 8) return false;
    if (browseFilters.goodFor.includes("Couples") && experience.group_size > 8) return false;
    if (browseFilters.goodFor.includes("First timers") && experience.rating < 4.8) return false;
    if (browseFilters.goodFor.includes("Kids") &&
      (experience.group_size < 2 || experience.group_size > 12)) return false;

    const searchText = `${experience.category} ${experience.title} ${experience.description}`.toLowerCase();
    if (browseFilters.featured.includes("Food culture") &&
      !["food", "cooking", "culinary", "tasting", "dining", "chef"].some((term) => searchText.includes(term))) {
      return false;
    }
    if (browseFilters.featured.includes("Day trips") && experience.duration_hours > 8) return false;
    const typeTerms: Record<string, string[]> = {
      Architecture: ["architecture", "building", "temple", "historic", "landmark"],
      "Art workshops": ["art", "workshop", "craft", "painting", "carving"],
      Beauty: ["beauty", "wellness", "spa"],
      Cooking: ["cooking", "chef", "pasta", "culinary", "masterclass"],
      "Cultural tours": ["culture", "cultural", "history", "historic", "temple", "tour"],
      Dining: ["dining", "food", "drink", "chef", "tasting"],
      Flying: ["flying", "flight", "balloon"],
      "Food tours": ["food", "market", "tasting", "culinary"],
      Galleries: ["gallery", "art", "exhibition"],
      Landmarks: ["landmark", "temple", "monument", "architecture"],
      Museums: ["museum", "culture", "history"],
      Outdoors: ["nature", "outdoor", "safari", "trek", "cruise", "hike"],
      Performances: ["performance", "dance", "music", "show"],
      "Shopping & fashion": ["shopping", "fashion", "market"],
      Tastings: ["tasting", "taste", "tea", "wine", "food"],
      "Water sports": ["cruise", "snorkel", "kayak", "sailing", "water"],
      Wellness: ["wellness", "spa", "yoga", "tea", "zen"],
      Wildlife: ["wildlife", "safari", "animal", "falcon"],
      Workouts: ["workout", "fitness", "yoga", "trek"],
    };
    if (browseFilters.types.length > 0 &&
      !browseFilters.types.some((type) => (typeTerms[type] ?? [type.toLowerCase()]).some((term) => searchText.includes(term)))) {
      return false;
    }

    const selectedTimes = browseFilters.times;
    if (selectedTimes.length > 0) {
      const time = experience.badge.match(/(\d{1,2})(?::\d{2})?\s*(AM|PM)/i);
      if (!time) return false;
      let hour = Number(time[1]) % 12;
      if (time[2].toUpperCase() === "PM") hour += 12;
      const period = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
      if (!selectedTimes.includes(period)) return false;
    }

    return true;
  });

  const rawExpCity = location || searchQuery || "";
  const displayExpCity = rawExpCity
    ? rawExpCity.split(/[,/]/)[0].trim().replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  const titleText = displayExpCity
    ? `Experiences in ${displayExpCity}`
    : searchQuery
    ? `Experiences matching "${searchQuery}"`
    : "Experiences this weekend";

  const subtitleText = displayExpCity
    ? `Verified local activities & tours in ${displayExpCity}`
    : "Unforgettable activities hosted by verified local experts";

  return (
    <div className="space-y-6">
      <div>
        {showFilters && (
          <ExperienceFilters
            value={browseFilters}
            onChange={setBrowseFilters}
            resultCount={filteredExperiences.length}
          />
        )}
        <div className="flex items-center gap-2 mb-2 group cursor-pointer inline-flex">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight group-hover:underline">
            {titleText}
          </h2>
          <ArrowRight className="w-5 h-5 text-neutral-900 group-hover:translate-x-1 transition-transform" />
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 mb-6">
          {subtitleText} ({filteredExperiences.length} available)
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-5 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-[4/3] bg-neutral-200 rounded-2xl" />
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredExperiences.length === 0 ? (
          <div className="py-14 text-center bg-neutral-50 rounded-3xl border border-neutral-200 max-w-xl mx-auto px-6">
            <Sparkles className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h4 className="font-bold text-neutral-900 text-lg">No experiences found</h4>
            <p className="text-sm text-neutral-500 mt-1.5 mb-5">
              Explore authentic local activities in popular world destinations:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["Chennai", "Dubai", "Kyoto", "Paris", "Tokyo", "Florence", "Goa"].map((city) => (
                <button
                  key={city}
                  onClick={() => setFilters((prev) => ({ ...prev, location: city }))}
                  className="px-3.5 py-1.5 bg-white border border-neutral-300 hover:border-black rounded-full text-xs font-semibold text-neutral-800 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-5">
            {filteredExperiences.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setSelectedExp(exp)}
                className="flex flex-col group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 mb-2.5 shadow-sm group-hover:shadow-md transition-all">
                  <img
                    src={exp.image_url}
                    alt={exp.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-neutral-900 shadow-sm">
                    {exp.badge}
                  </span>

                  {/* Heart wishlist button */}
                  <button
                    onClick={(e) => toggleLike(e, exp.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    aria-label="Save experience"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        likes[exp.id]
                          ? "fill-[#FF385C] text-[#FF385C]"
                          : "text-white fill-black/30 stroke-white stroke-[2]"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                  <div className="flex items-center gap-1 font-semibold text-neutral-900">
                    <Star className="w-3.5 h-3.5 fill-black text-black" />
                    <span>{exp.rating.toFixed(2)}</span>
                    <span className="text-neutral-400 font-normal">({exp.review_count})</span>
                  </div>
                  <span className="truncate max-w-[120px]">{exp.city}</span>
                </div>

                <h3 className="font-semibold text-sm text-neutral-900 line-clamp-2 leading-snug group-hover:underline mb-1">
                  {exp.title}
                </h3>

                <p className="text-xs text-neutral-700">
                  <span className="font-bold text-neutral-900">
                    {formatPrice(exp.price_per_person)}
                  </span>
                  <span className="text-neutral-500"> / guest</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience Detail Modal */}
      {selectedExp && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedExp(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full bg-neutral-100">
              <img
                src={selectedExp.image_url}
                alt={selectedExp.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedExp(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-neutral-900">
                {selectedExp.badge}
              </span>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#FF385C]">
                  {selectedExp.category} · {selectedExp.city}, {selectedExp.country}
                </span>
                <div className="flex items-center gap-1 text-sm font-semibold text-neutral-900">
                  <Star className="w-4 h-4 fill-black text-black" />
                  <span>{selectedExp.rating.toFixed(2)}</span>
                  <span className="text-neutral-500 font-normal">({selectedExp.review_count} reviews)</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug mb-3">
                {selectedExp.title}
              </h2>

              <p className="text-sm text-neutral-600 mb-5 leading-relaxed">
                {selectedExp.description}
              </p>

              <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-2xl mb-6 text-xs text-neutral-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span>{selectedExp.duration_hours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-500" />
                  <span>Up to {selectedExp.group_size} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-neutral-500" />
                  <span className="truncate">{selectedExp.language}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div>
                  <p className="text-xs text-neutral-500">Price per guest</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {formatPrice(selectedExp.price_per_person)}
                  </p>
                </div>
                <button
                  onClick={() => handleBookExperience(selectedExp)}
                  className="bg-[#FF385C] hover:bg-[#D90B38] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                >
                  Book Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------- SERVICES SECTION -----------------
interface ServicesSectionProps {
  location?: string;
  searchQuery?: string;
  category?: string;
}

export function ServicesSection({ location, searchQuery, category }: ServicesSectionProps = {}) {
  const { formatPrice, addToast } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const [selectedSrv, setSelectedSrv] = useState<Service | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await getServices({
          location: location || undefined,
          search: searchQuery || undefined,
          category: category || undefined,
        });
        if (isMounted) {
          setServices(data);
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [location, searchQuery, category]);

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikes((prev) => {
      const next = !prev[id];
      if (next) {
        addToast("Added service to your favorites!", "success");
      } else {
        addToast("Removed service from favorites", "info");
      }
      return { ...prev, [id]: next };
    });
  };

  const handleBookService = (srv: Service) => {
    addToast(`Reserved: "${srv.title}" at ${formatPrice(srv.price)} / ${srv.unit}!`, "success");
    setSelectedSrv(null);
  };

  const rawCity = location || searchQuery || "";
  const displayCity = rawCity
    ? rawCity.split(/[,/]/)[0].trim().replace(/\b\w/g, (c) => c.toUpperCase())
    : "this area";

  const titleText = searchQuery
    ? `Services matching "${searchQuery}"`
    : location
    ? `Services available in ${location}`
    : "Premium travel & home services";

  const subtitleText = searchQuery
    ? `Specialized hospitality professionals for "${searchQuery}"`
    : "Hand-picked hospitality services to elevate your stay";

  if (!loading && services.length === 0) {
    return (
      <div className="py-14 sm:py-24 px-4 max-w-5xl mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Left: 3 Fanned Tilted Cards Matching Airbnb Screenshot */}
          <div className="relative w-[300px] sm:w-[360px] h-[260px] sm:h-[300px] flex-shrink-0 select-none">
            {/* Card 1: Left / Camera (Tilted Counter-Clockwise) */}
            <div className="absolute left-0 sm:left-2 top-8 sm:top-10 w-36 h-36 sm:w-44 sm:h-44 rounded-3xl sm:rounded-[32px] overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.18)] border-2 border-white transform -rotate-[14deg] hover:rotate-0 transition-transform duration-300 z-10 bg-neutral-100">
              <img
                src="/services/unavailable_camera.jpg"
                alt="Photography service"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 2: Center-Top / Wellness Spa & Jade Roller (Tilted Clockwise) */}
            <div className="absolute top-0 left-20 sm:left-26 w-36 h-36 sm:w-44 sm:h-44 rounded-3xl sm:rounded-[32px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.14)] border-2 border-white transform rotate-[7deg] hover:rotate-0 transition-transform duration-300 z-0 bg-neutral-100">
              <img
                src="/services/unavailable_spa.jpg"
                alt="Wellness and spa"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 3: Front-Right / Chef Plating (Slight Angle) */}
            <div className="absolute right-0 bottom-0 w-40 h-40 sm:w-48 sm:h-48 rounded-3xl sm:rounded-[32px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.22)] border-2 border-white transform rotate-[1deg] hover:rotate-0 transition-transform duration-300 z-20 bg-neutral-100">
              <img
                src="/services/unavailable_chef.jpg"
                alt="Private chef service"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Exact Headline and Subtitle from Screenshot */}
          <div className="max-w-lg text-left">
            <h2 className="text-3xl sm:text-[38px] lg:text-[44px] font-bold text-neutral-900 tracking-tight leading-[1.15]">
              Services aren’t available in {displayCity} yet
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-700 mt-4 leading-relaxed font-normal">
              Change the location to find services in other areas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2 group cursor-pointer inline-flex">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight group-hover:underline">
            {titleText}
          </h2>
          <ArrowRight className="w-5 h-5 text-neutral-900 group-hover:translate-x-1 transition-transform" />
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 mb-6">
          {subtitleText} ({services.length} available)
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-5 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-[4/3] bg-neutral-200 rounded-2xl" />
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-5">
            {services.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedSrv(srv)}
                className="flex flex-col group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 mb-2.5 shadow-sm group-hover:shadow-md transition-all">
                  <img
                    src={srv.image_url}
                    alt={srv.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Category tag */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-neutral-900 shadow-sm">
                    {srv.category}
                  </span>

                  {/* Heart wishlist button */}
                  <button
                    onClick={(e) => toggleLike(e, srv.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    aria-label="Save service"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        likes[srv.id]
                          ? "fill-[#FF385C] text-[#FF385C]"
                          : "text-white fill-black/30 stroke-white stroke-[2]"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                  <div className="flex items-center gap-1 font-semibold text-neutral-900">
                    <Star className="w-3.5 h-3.5 fill-black text-black" />
                    <span>{srv.rating.toFixed(2)}</span>
                    <span className="text-neutral-400 font-normal">({srv.review_count})</span>
                  </div>
                  <span className="truncate max-w-[120px]">{srv.location}</span>
                </div>

                <h3 className="font-semibold text-sm text-neutral-900 line-clamp-2 leading-snug group-hover:underline mb-1">
                  {srv.title}
                </h3>

                <p className="text-xs text-neutral-700">
                  <span className="font-bold text-neutral-900">
                    {formatPrice(srv.price)}
                  </span>
                  <span className="text-neutral-500"> / {srv.unit}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      {selectedSrv && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedSrv(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full bg-neutral-100">
              <img
                src={selectedSrv.image_url}
                alt={selectedSrv.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedSrv(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-neutral-900">
                {selectedSrv.service_type}
              </span>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#FF385C]">
                  {selectedSrv.category} · {selectedSrv.location}
                </span>
                <div className="flex items-center gap-1 text-sm font-semibold text-neutral-900">
                  <Star className="w-4 h-4 fill-black text-black" />
                  <span>{selectedSrv.rating.toFixed(2)}</span>
                  <span className="text-neutral-500 font-normal">({selectedSrv.review_count} reviews)</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug mb-3">
                {selectedSrv.title}
              </h2>

              <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                {selectedSrv.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div>
                  <p className="text-xs text-neutral-500">Service Rate</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {formatPrice(selectedSrv.price)}
                    <span className="text-sm font-normal text-neutral-500"> / {selectedSrv.unit}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleBookService(selectedSrv)}
                  className="bg-[#222222] hover:bg-black text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                >
                  Request Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
