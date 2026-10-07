"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Menu,
  User as UserIcon,
  Heart,
  Briefcase,
  Home,
  UserCheck,
  Globe,
  Bell,
  Compass,
  Sparkles,
  PlusCircle,
  X,
  MapPin,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CALENDAR_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATE_FLEXIBILITY_OPTIONS = ["Exact date", "± 1 day", "± 2 days", "± 3 days", "± 7 days", "± 14 days"];

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSearchDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getCalendarDays(month: Date): Array<Date | null> {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const offset = new Date(year, monthIndex, 1).getDay();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: days }, (_, index) => new Date(year, monthIndex, index + 1)),
  ];
}

export default function Navbar() {
  const router = useRouter();
  const {
    currentUser,
    users,
    switchUser,
    filters,
    setFilters,
    headerTab,
    setHeaderTab,
    currency,
    setCurrency,
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTab, setSearchTab] = useState<"where" | "when" | "who">("where");
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [checkInFlexibility, setCheckInFlexibility] = useState(DATE_FLEXIBILITY_OPTIONS[0]);
  const [checkOutFlexibility, setCheckOutFlexibility] = useState(DATE_FLEXIBILITY_OPTIONS[0]);
  const [openFlexibility, setOpenFlexibility] = useState<"checkin" | "checkout" | null>(null);
  const [animatingTab, setAnimatingTab] = useState<"all" | "globe" | "house" | "parachute" | "bell" | null>("all");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Trigger signature animations on initial page load / refresh & sync with URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab")?.toLowerCase();
      if (tabParam === "homes") setHeaderTab("Homes");
      else if (tabParam === "experiences") setHeaderTab("Experiences");
      else if (tabParam === "services") setHeaderTab("Services");
      else if (tabParam === "all") setHeaderTab("All");
    }

    setAnimatingTab("all");
    const timer = setTimeout(() => {
      setAnimatingTab(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [setHeaderTab]);

  const handleTabClick = (tab: "All" | "Homes" | "Experiences" | "Services") => {
    setHeaderTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab === "All") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab.toLowerCase());
      }
      window.history.replaceState({}, "", url.toString());
    }

    if (tab === "All") setAnimatingTab("globe");
    else if (tab === "Homes") setAnimatingTab("house");
    else if (tab === "Experiences") setAnimatingTab("parachute");
    else if (tab === "Services") setAnimatingTab("bell");

    setTimeout(() => {
      setAnimatingTab(null);
    }, tab === "All" || tab === "Homes" ? 2500 : 1200);
  };

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateGuestTotal = (nextAdults: number, nextChildren: number) => {
    setFilters((prev) => ({
      ...prev,
      guests: Math.min(16, nextAdults + nextChildren),
    }));
  };

  const changeAdults = (delta: number) => {
    const nextAdults = Math.max(0, Math.min(16 - children, adults + delta));
    setAdults(nextAdults);
    updateGuestTotal(nextAdults, children);
  };

  const changeChildren = (delta: number) => {
    const nextChildren = Math.max(0, Math.min(16 - adults, children + delta));
    setChildren(nextChildren);
    updateGuestTotal(adults, nextChildren);
  };

  const selectCalendarDate = (date: Date) => {
    const value = toDateInputValue(date);
    if (!filters.checkIn || filters.checkOut || value <= filters.checkIn) {
      setFilters((prev) => ({ ...prev, checkIn: value, checkOut: "" }));
      return;
    }
    setFilters((prev) => ({ ...prev, checkOut: value }));
  };

  const moveCalendarMonth = (offset: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followingMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchActive(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EBEBEB] transition-all">
      {/* Top Header Row (Navigations pane 0.35x bigger) */}
      <div className="max-w-[2520px] mx-auto px-4 sm:px-8 xl:px-16 pt-4 pb-2.5 flex items-center justify-between gap-5">
        {/* Left: Airbnb Brand Logo (0.4x bigger) */}
        <Link
          href="/"
          onClick={() => handleTabClick("All")}
          className="flex items-center group flex-shrink-0 cursor-pointer"
        >
          <img
            src="/icons/airbnb-logo.png"
            alt="Airbnb"
            className="h-11 md:h-13 w-auto object-contain transition-transform group-hover:scale-[1.03]"
          />
        </Link>

        {/* Center: Iconic Navigation Tabs (0.35x bigger, smooth interaction) */}
        <div className="hidden md:flex items-center gap-8 lg:gap-11">
          {/* Tab 1: All */}
          <button
            onClick={() => handleTabClick("All")}
            className={`flex items-center gap-2.5 pb-2 relative transition-all group cursor-pointer select-none ${
              headerTab === "All" ? "text-[#222222] font-bold" : "text-[#717171] hover:text-[#222222] font-semibold"
            }`}
          >
            <div
              className={`flex items-center justify-center origin-center transition-transform duration-200 ease-out group-hover:scale-110 active:scale-95 cursor-pointer ${
                animatingTab === "all" || animatingTab === "globe"
                  ? "animate-earth-anticlockwise"
                  : ""
              }`}
            >
              <img
                src="/icons/tab-all.png"
                alt="All"
                className={`h-[38px] lg:h-[41px] w-auto max-w-[46px] object-contain transition-all duration-200 ${
                  headerTab === "All" ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                }`}
              />
            </div>
            <span className="text-[16px] lg:text-[17px] tracking-tight">All</span>
            {headerTab === "All" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#222222] rounded-full" />
            )}
          </button>

          {/* Tab 2: Homes */}
          <button
            onClick={() => handleTabClick("Homes")}
            className={`flex items-center gap-2.5 pb-2 relative transition-all group cursor-pointer select-none ${
              headerTab === "Homes" ? "text-[#222222] font-bold" : "text-[#717171] hover:text-[#222222] font-semibold"
            }`}
          >
            <div
              className={`flex items-center justify-center origin-bottom transition-transform duration-200 ease-out group-hover:scale-110 active:scale-95 cursor-pointer ${
                animatingTab === "all" || animatingTab === "house"
                  ? "animate-house-rotate"
                  : ""
              }`}
            >
              <img
                src="/icons/tab-homes.png"
                alt="Homes"
                className={`h-[35px] lg:h-[38px] w-auto max-w-[46px] object-contain transition-all duration-200 ${
                  headerTab === "Homes" ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                }`}
              />
            </div>
            <span className="text-[16px] lg:text-[17px] tracking-tight">Homes</span>
            {headerTab === "Homes" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#222222] rounded-full" />
            )}
          </button>

          {/* Tab 3: Experiences */}
          <button
            onClick={() => handleTabClick("Experiences")}
            className={`flex items-center gap-2.5 pb-2 relative transition-all group cursor-pointer select-none ${
              headerTab === "Experiences" ? "text-[#222222] font-bold" : "text-[#717171] hover:text-[#222222] font-semibold"
            }`}
          >
            <div
              className={`flex items-center justify-center origin-bottom transition-transform duration-200 ease-out group-hover:scale-110 active:scale-95 cursor-pointer ${
                animatingTab === "all" || animatingTab === "parachute"
                  ? "animate-parachute-jump"
                  : ""
              }`}
            >
              <img
                src="/icons/tab-experiences.png"
                alt="Experiences"
                className={`h-[36px] lg:h-[39px] w-auto max-w-[44px] object-contain transition-all duration-200 ${
                  headerTab === "Experiences" ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                }`}
              />
            </div>
            <span className="text-[16px] lg:text-[17px] tracking-tight">Experiences</span>
            {headerTab === "Experiences" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#222222] rounded-full" />
            )}
          </button>

          {/* Tab 4: Services */}
          <button
            onClick={() => handleTabClick("Services")}
            className={`flex items-center gap-2.5 pb-2 relative transition-all group cursor-pointer select-none ${
              headerTab === "Services" ? "text-[#222222] font-bold" : "text-[#717171] hover:text-[#222222] font-semibold"
            }`}
          >
            <div
              className={`flex items-center justify-center origin-bottom transition-transform duration-200 ease-out group-hover:scale-110 active:scale-95 cursor-pointer ${
                animatingTab === "all" || animatingTab === "bell"
                  ? "animate-bell-ring"
                  : ""
              }`}
            >
              <img
                src="/icons/tab-services.png"
                alt="Services"
                className={`h-[34px] lg:h-[36px] w-auto max-w-[44px] object-contain transition-all duration-200 ${
                  headerTab === "Services" ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                }`}
              />
            </div>
            <span className="text-[16px] lg:text-[17px] tracking-tight">Services</span>
            {headerTab === "Services" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#222222] rounded-full" />
            )}
          </button>
        </div>

        {/* Right: Become a Host & User Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3" ref={menuRef}>
          <Link
            href="/host"
            className="text-sm lg:text-[15px] font-semibold text-[#222222] hover:bg-[#F7F7F7] px-3.5 py-2 rounded-full transition-colors hidden sm:block cursor-pointer"
          >
            Become a host
          </Link>

          {/* User Icon Circle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-neutral-700 hover:shadow-md transition-shadow cursor-pointer"
            title="Profile menu"
          >
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-4.5 h-4.5 stroke-[2]" />
            )}
          </button>

          {/* Hamburger Menu Circle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-neutral-700 hover:shadow-md transition-shadow cursor-pointer"
            title="Navigation Menu"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-4 top-14 mt-1 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2.5 z-50 text-sm animate-modal">
              {/* Active Profile Info */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-neutral-400 font-medium">Logged in as</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="font-semibold text-neutral-900 truncate">
                    {currentUser?.name}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      currentUser?.role === "host"
                        ? "bg-rose-100 text-[#FF385C]"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="py-1.5">
                <Link
                  href="/trips"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#F7F7F7] font-medium text-neutral-800 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-neutral-500" />
                  My Trips
                </Link>
                <Link
                  href="/wishlists"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#F7F7F7] font-medium text-neutral-800 transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  Wishlists
                </Link>
              </div>

              <div className="border-t border-gray-100 py-1.5">
                <Link
                  href="/host"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#F7F7F7] font-semibold text-neutral-900 transition-colors"
                >
                  <Home className="w-4 h-4 text-[#FF385C]" />
                  Host Dashboard
                </Link>
                <Link
                  href="/host/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#F7F7F7] font-medium text-neutral-700 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-neutral-500" />
                  Create a new listing
                </Link>
              </div>

              {/* Demo User Switcher */}
              <div className="border-t border-gray-100 pt-2 px-4 pb-1">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Switch Demo User
                </p>
                <div className="flex flex-col gap-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                        currentUser?.id === u.id
                          ? "bg-rose-50 text-[#FF385C] font-semibold"
                          : "hover:bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      <span className="truncate">
                        {u.name} ({u.role})
                      </span>
                      {currentUser?.id === u.id && (
                        <UserCheck className="w-3.5 h-3.5 text-[#FF385C]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Selector */}
              <div className="border-t border-gray-100 py-2 px-4 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-600">Currency</span>
                <button
                  onClick={() => setCurrency(currency === "INR" ? "USD" : "INR")}
                  className="text-xs font-bold px-2.5 py-1 rounded-full border border-gray-300 hover:border-black text-neutral-800 transition-colors cursor-pointer"
                >
                  {currency === "INR" ? "₹ INR" : "$ USD"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Category Tab Row (< md) (0.35x bigger) */}
      <div className="flex md:hidden items-center justify-center gap-6 sm:gap-8 px-4 pt-2 pb-2.5 border-b border-gray-100 text-xs sm:text-sm font-semibold text-neutral-700">
        <button
          onClick={() => handleTabClick("All")}
          className={`flex items-center gap-2 pb-1 relative transition-all group cursor-pointer select-none ${
            headerTab === "All" ? "text-[#222222] font-bold" : "text-[#717171]"
          }`}
        >
          <div
            className={`origin-center transition-transform duration-200 group-hover:scale-110 active:scale-95 ${
              animatingTab === "all" || animatingTab === "globe"
                ? "animate-earth-anticlockwise"
                : ""
            }`}
          >
            <img src="/icons/tab-all.png" alt="All" className="h-7 sm:h-8 w-auto max-w-[34px] object-contain" />
          </div>
          <span className="text-xs sm:text-sm">All</span>
          {headerTab === "All" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#222222] rounded-full" />
          )}
        </button>

        <button
          onClick={() => handleTabClick("Homes")}
          className={`flex items-center gap-2 pb-1 relative transition-all group cursor-pointer select-none ${
            headerTab === "Homes" ? "text-[#222222] font-bold" : "text-[#717171]"
          }`}
        >
          <div
            className={`origin-center transition-transform duration-200 group-hover:scale-110 active:scale-95 ${
              animatingTab === "all" || animatingTab === "house"
                ? "animate-house-rotate"
                : ""
            }`}
          >
            <img src="/icons/tab-homes.png" alt="Homes" className="h-7 sm:h-8 w-auto max-w-[34px] object-contain" />
          </div>
          <span className="text-xs sm:text-sm">Homes</span>
          {headerTab === "Homes" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#222222] rounded-full" />
          )}
        </button>

        <button
          onClick={() => handleTabClick("Experiences")}
          className={`flex items-center gap-2 pb-1 relative transition-all group cursor-pointer select-none ${
            headerTab === "Experiences" ? "text-[#222222] font-bold" : "text-[#717171]"
          }`}
        >
          <div
            className={`origin-bottom transition-transform duration-200 group-hover:scale-110 active:scale-95 ${
              animatingTab === "all" || animatingTab === "parachute"
                ? "animate-parachute-jump"
                : ""
            }`}
          >
            <img src="/icons/tab-experiences.png" alt="Experiences" className="h-7 sm:h-8 w-auto max-w-[34px] object-contain" />
          </div>
          <span className="text-xs sm:text-sm">Experiences</span>
          {headerTab === "Experiences" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#222222] rounded-full" />
          )}
        </button>

        <button
          onClick={() => handleTabClick("Services")}
          className={`flex items-center gap-2 pb-1 relative transition-all group cursor-pointer select-none ${
            headerTab === "Services" ? "text-[#222222] font-bold" : "text-[#717171]"
          }`}
        >
          <div
            className={`origin-bottom transition-transform duration-200 group-hover:scale-110 active:scale-95 ${
              animatingTab === "all" || animatingTab === "bell"
                ? "animate-bell-ring"
                : ""
            }`}
          >
            <img src="/icons/tab-services.png" alt="Services" className="h-6.5 sm:h-7.5 w-auto max-w-[34px] object-contain" />
          </div>
          <span className="text-xs sm:text-sm">Services</span>
          {headerTab === "Services" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#222222] rounded-full" />
          )}
        </button>
      </div>

      {/* Floating Centered Search Bar (Compact sleek design) */}
      <div className="max-w-[720px] mx-auto px-4 pb-3.5 pt-0.5 relative" ref={searchRef}>
        <div className="bg-white border border-neutral-300 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex items-center divide-x divide-neutral-200">
          {/* 1. Where */}
          <div
            onClick={() => {
              setIsSearchActive(true);
              setSearchTab("where");
            }}
            className={`flex-1 py-1.5 sm:py-2 px-4 sm:px-5 rounded-l-full cursor-pointer transition-colors ${
              isSearchActive && searchTab === "where" ? "bg-neutral-100" : "hover:bg-neutral-50"
            }`}
          >
            <p className="text-[10.5px] font-bold text-neutral-800 leading-tight">Where</p>
            <input
              type="text"
              placeholder={
                headerTab === "Experiences"
                  ? "Search by city or landmark"
                  : "Search destinations"
              }
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full text-xs sm:text-[13px] font-medium text-neutral-800 placeholder-neutral-400 bg-transparent focus:outline-none"
            />
          </div>

          {/* 2. When */}
          <div
            onClick={() => {
              setIsSearchActive(true);
              setSearchTab("when");
            }}
            className={`w-28 sm:w-36 py-1.5 sm:py-2 px-3 sm:px-4 cursor-pointer transition-colors ${
              isSearchActive && searchTab === "when" ? "bg-neutral-100" : "hover:bg-neutral-50"
            }`}
          >
            <p className="text-[10.5px] font-bold text-neutral-800 leading-tight">When</p>
            <div className="text-xs sm:text-[13px] text-neutral-500 font-medium truncate">
              {filters.checkIn && filters.checkOut
                ? `${formatSearchDate(filters.checkIn)} – ${formatSearchDate(filters.checkOut)}`
                : filters.checkIn
                ? `${formatSearchDate(filters.checkIn)} – Add checkout`
                : "Add dates"}
            </div>
          </div>

          {/* 3. Who / Type of service */}
          <div
            onClick={() => {
              setIsSearchActive(true);
              setSearchTab("who");
            }}
            className={`w-28 sm:w-36 py-1.5 sm:py-2 px-3 sm:px-4 cursor-pointer transition-colors ${
              isSearchActive && searchTab === "who" ? "bg-neutral-100" : "hover:bg-neutral-50"
            }`}
          >
            {headerTab === "Services" ? (
              <>
                <p className="text-[10.5px] font-bold text-neutral-800 leading-tight">Type of service</p>
                <div className="text-xs sm:text-[13px] text-neutral-500 font-medium truncate">
                  Add service
                </div>
              </>
            ) : (
              <>
                <p className="text-[10.5px] font-bold text-neutral-800 leading-tight">Who</p>
                <div className="text-xs sm:text-[13px] text-neutral-500 font-medium truncate">
                  {adults + children > 0 || pets > 0
                    ? `${filters.guests} guest${filters.guests === 1 ? "" : "s"}${pets ? `, ${pets} pet${pets === 1 ? "" : "s"}` : ""}`
                    : "Add guests"}
                </div>
              </>
            )}
          </div>

          {/* Search Button */}
          <div className="pr-1.5 pl-1 py-1">
            <button
              onClick={handleSearchSubmit}
              className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Dropdown Panel for Search Inputs */}
        {isSearchActive && (
          <div
            className={`absolute top-14 z-50 mt-1 animate-modal rounded-[28px] border border-gray-200 bg-white shadow-2xl ${
              searchTab === "when"
                ? "left-1/2 w-[min(980px,calc(100vw-32px))] -translate-x-1/2 p-4 sm:top-15 sm:p-5"
                : searchTab === "who"
                ? "right-0 w-[min(580px,calc(100vw-32px))] p-6 sm:top-15 sm:p-8"
                : "left-4 right-4 mx-auto mt-1 max-w-xl p-5 sm:top-15"
            }`}
          >
            {searchTab === "where" && (
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2.5">
                  Popular destinations
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Hyderabad", query: "Hyderabad" },
                    { label: "Coimbatore", query: "Coimbatore" },
                    { label: "Goa", query: "Goa" },
                    { label: "Santorini", query: "Santorini" },
                    { label: "Bali", query: "Bali" },
                    { label: "All Destinations", query: "" },
                  ].map((d) => (
                    <button
                      key={d.label}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, location: d.query }));
                        setSearchTab("when");
                      }}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-black text-xs font-semibold text-left flex items-center gap-2 hover:bg-neutral-50 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchTab === "when" && (
              <div>
                <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                  {[visibleMonth, followingMonth].map((month, monthIndex) => (
                    <section
                      key={`${month.getFullYear()}-${month.getMonth()}`}
                      aria-label={month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    >
                      <div className="relative mb-3 flex h-8 items-center justify-center">
                        {monthIndex === 0 && (
                          <button
                            type="button"
                            aria-label="Previous month"
                            disabled={month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()}
                            onClick={() => moveCalendarMonth(-1)}
                            className="absolute left-0 rounded-full p-2 hover:bg-neutral-100 disabled:opacity-25 disabled:hover:bg-transparent"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                        )}
                        <h3 className="text-base font-semibold text-neutral-800">
                          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </h3>
                        {monthIndex === 1 && (
                          <button
                            type="button"
                            aria-label="Next month"
                            onClick={() => moveCalendarMonth(1)}
                            className="absolute right-0 rounded-full p-2 hover:bg-neutral-100"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      <div className="mb-1 grid grid-cols-7">
                        {CALENDAR_WEEKDAYS.map((weekday) => (
                          <span key={weekday} className="flex h-7 items-center justify-center text-xs font-medium text-neutral-500">
                            {weekday}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7">
                        {getCalendarDays(month).map((date, index) => {
                          if (!date) return <span key={`empty-${index}`} className="h-9" />;
                          const value = toDateInputValue(date);
                          const isPast = date < today;
                          const isSelected = value === filters.checkIn || value === filters.checkOut;
                          const isInRange = Boolean(
                            filters.checkIn && filters.checkOut && value > filters.checkIn && value < filters.checkOut
                          );
                          return (
                            <button
                              key={value}
                              type="button"
                              disabled={isPast}
                              onClick={() => selectCalendarDate(date)}
                              aria-pressed={isSelected}
                              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                                isSelected
                                  ? "bg-neutral-900 text-white"
                                  : isInRange
                                  ? "bg-neutral-100 text-neutral-900"
                                  : isPast
                                  ? "cursor-not-allowed text-neutral-300"
                                  : "text-neutral-800 hover:border hover:border-neutral-800"
                              }`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>

                <div className="mt-4 flex flex-col justify-end gap-3 sm:flex-row">
                  {([
                    ["checkin", "Check-in", checkInFlexibility, setCheckInFlexibility],
                    ["checkout", "Checkout", checkOutFlexibility, setCheckOutFlexibility],
                  ] as const).map(([key, label, value, setValue]) => (
                    <div key={key} className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenFlexibility(openFlexibility === key ? null : key)}
                        className="flex w-full items-center justify-between rounded-2xl border border-neutral-300 px-4 py-2.5 text-left hover:border-neutral-500 sm:w-[220px]"
                      >
                        <span>
                          <span className="block text-xs text-neutral-500">{label}</span>
                          <span className="block text-sm text-neutral-800">{value}</span>
                        </span>
                        <ChevronRight className={`h-5 w-5 rotate-90 transition-transform ${openFlexibility === key ? "-rotate-90" : ""}`} />
                      </button>
                      {openFlexibility === key && (
                        <div className="absolute bottom-full right-0 z-10 mb-2 w-full rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl">
                          {DATE_FLEXIBILITY_OPTIONS.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setValue(option);
                                setOpenFlexibility(null);
                              }}
                              className={`w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 ${
                                value === option ? "font-semibold text-neutral-900" : "text-neutral-600"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, checkIn: "", checkOut: "" }))}
                    className="rounded-full px-4 py-2 text-sm font-semibold underline underline-offset-2 hover:bg-neutral-100"
                  >
                    Clear dates
                  </button>
                </div>
              </div>
            )}

            {searchTab === "who" && (
              <div>
                {([
                  ["Adults", "Ages 13 or above", adults, changeAdults, 0],
                  ["Children", "Ages 2–12", children, changeChildren, 0],
                  ["Infants", "Under 2", infants, setInfants, 0],
                  ["Pets", "Bringing a service animal?", pets, setPets, 0],
                ] as const).map(([label, description, count, setCount, minimum], index) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between py-6 ${index < 3 ? "border-b border-neutral-200" : ""}`}
                  >
                    <div className="pr-3">
                      <p className="text-[17px] font-semibold text-neutral-900">{label}</p>
                      <p className={`text-sm ${label === "Pets" ? "text-neutral-400 underline" : "text-neutral-500"}`}>
                        {description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        aria-label={`Remove ${label.toLowerCase()}`}
                        disabled={count <= minimum}
                        onClick={() => {
                          if (label === "Adults") changeAdults(-1);
                          else if (label === "Children") changeChildren(-1);
                          else setCount(Math.max(minimum, count - 1));
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-300"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-4 text-center text-base font-medium text-neutral-900">{count}</span>
                      <button
                        type="button"
                        aria-label={`Add ${label.toLowerCase()}`}
                        disabled={
                          (label === "Adults" || label === "Children") && adults + children >= 16
                          || (label === "Infants" || label === "Pets") && count >= 5
                        }
                        onClick={() => {
                          if (label === "Adults") changeAdults(1);
                          else if (label === "Children") changeChildren(1);
                          else setCount(count + 1);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-300"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setIsSearchActive(false)}
                  className="mt-3 w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md btn-airbnb-gradient"
                >
                  Apply & Search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
