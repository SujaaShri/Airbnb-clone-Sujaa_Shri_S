"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Search, MapPin, X, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATE_FLEXIBILITY_OPTIONS = ["Exact date", "± 1 day", "± 2 days", "± 3 days", "± 7 days", "± 14 days"];

function dateToInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getMonthDays(month: Date): Array<Date | null> {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, monthIndex, index + 1)),
  ];
}

const SUGGESTED_DESTINATIONS = [
  { name: "All Destinations", query: "" },
  { name: "Paris, France", query: "Paris" },
  { name: "Tokyo, Japan", query: "Tokyo" },
  { name: "Dubai, UAE", query: "Dubai" },
  { name: "Goa, India", query: "Goa" },
  { name: "Hyderabad, India", query: "Hyderabad" },
  { name: "Coimbatore, India", query: "Coimbatore" },
  { name: "New York, USA", query: "New York" },
  { name: "London, UK", query: "London" },
  { name: "Rome, Italy", query: "Rome" },
  { name: "Santorini, Greece", query: "Santorini" },
  { name: "Bali, Indonesia", query: "Bali" },
];

export default function SearchBarExpanded() {
  const { filters, setFilters, isSearchExpanded, setIsSearchExpanded, headerTab, setHeaderTab } = useApp();
  const [activeTab, setActiveTab] = useState<"where" | "checkin" | "checkout" | "who">("where");
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [adults, setAdults] = useState(() => Math.max(1, filters.guests || 1));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [checkInFlexibility, setCheckInFlexibility] = useState(DATE_FLEXIBILITY_OPTIONS[0]);
  const [checkOutFlexibility, setCheckOutFlexibility] = useState(DATE_FLEXIBILITY_OPTIONS[0]);
  const [openFlexibility, setOpenFlexibility] = useState<"checkin" | "checkout" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }
    if (isSearchExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchExpanded, setIsSearchExpanded]);

  if (!isSearchExpanded) return null;

  const handleDestinationSelect = (destQuery: string) => {
    setFilters((prev) => ({ ...prev, location: destQuery }));
    setActiveTab("checkin");
  };

  const updateGuestTotal = (nextAdults: number, nextChildren: number) => {
    setFilters((prev) => ({
      ...prev,
      guests: Math.min(16, nextAdults + nextChildren),
    }));
  };

  const changeAdults = (delta: number) => {
    const nextAdults = Math.max(1, Math.min(16 - children, adults + delta));
    setAdults(nextAdults);
    updateGuestTotal(nextAdults, children);
  };

  const changeChildren = (delta: number) => {
    const nextChildren = Math.max(0, Math.min(16 - adults, children + delta));
    setChildren(nextChildren);
    updateGuestTotal(adults, nextChildren);
  };

  const selectDate = (selectedDate: Date) => {
    const value = dateToInputValue(selectedDate);
    if (!filters.checkIn || filters.checkOut || value <= filters.checkIn) {
      setFilters((prev) => ({ ...prev, checkIn: value, checkOut: "" }));
      setActiveTab("checkout");
      return;
    }
    setFilters((prev) => ({ ...prev, checkOut: value }));
  };

  const moveMonth = (offset: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);

  const handleSearchSubmit = () => {
    setIsSearchExpanded(false);
  };

  const placeholderText = headerTab === "Experiences"
    ? "Search experiences or destinations (e.g. Kyoto, Dubai, Safari)"
    : headerTab === "Services"
    ? "Search services (e.g. Chef, Massage, Chauffeur)"
    : "Search destinations (e.g. Paris, Tokyo, Goa)";

  return (
    <div className="bg-white border-b border-gray-200 shadow-xl py-6 px-4 transition-all animate-fade-in relative z-30">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6 text-sm font-semibold text-neutral-800">
            <button
              type="button"
              onClick={() => setHeaderTab("Homes")}
              className={`pb-1 transition-colors cursor-pointer ${
                headerTab === "Homes" || headerTab === "All"
                  ? "border-b-2 border-black text-black font-bold"
                  : "text-neutral-400 hover:text-black font-medium"
              }`}
            >
              Stays
            </button>
            <button
              type="button"
              onClick={() => setHeaderTab("Experiences")}
              className={`pb-1 transition-colors cursor-pointer ${
                headerTab === "Experiences"
                  ? "border-b-2 border-black text-black font-bold"
                  : "text-neutral-400 hover:text-black font-medium"
              }`}
            >
              Experiences
            </button>
            <button
              type="button"
              onClick={() => setHeaderTab("Services")}
              className={`pb-1 transition-colors cursor-pointer ${
                headerTab === "Services"
                  ? "border-b-2 border-black text-black font-bold"
                  : "text-neutral-400 hover:text-black font-medium"
              }`}
            >
              Services
            </button>
          </div>
          <button
            onClick={() => setIsSearchExpanded(false)}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pill Bar */}
        <div className="flex flex-col md:flex-row items-center bg-[#EBEBEB] p-1.5 rounded-3xl md:rounded-full border border-gray-200 relative">
          {/* Where */}
          <div
            onClick={() => setActiveTab("where")}
            className={`w-full md:flex-1 py-3 px-6 rounded-full cursor-pointer transition-colors ${
              activeTab === "where" ? "bg-white shadow-md" : "hover:bg-neutral-200/60"
            }`}
          >
            <p className="text-[11px] font-bold tracking-wider text-neutral-800 uppercase">
              {headerTab === "Services" ? "Service / City" : "Where"}
            </p>
            <input
              type="text"
              placeholder={placeholderText}
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder-neutral-500 focus:outline-none"
            />
          </div>

          {/* Check in */}
          <button
            type="button"
            onClick={() => setActiveTab("checkin")}
            className={`w-full md:w-36 py-3 px-5 rounded-full cursor-pointer transition-colors text-left ${
              activeTab === "checkin" ? "bg-white shadow-md" : "hover:bg-neutral-200/60"
            }`}
          >
            <p className="text-[11px] font-bold tracking-wider text-neutral-800 uppercase">Check in</p>
            <p className="truncate text-xs font-medium text-neutral-800">
              {filters.checkIn ? formatDate(new Date(`${filters.checkIn}T00:00:00`)) : "Add dates"}
            </p>
          </button>

          {/* Check out */}
          <button
            type="button"
            onClick={() => setActiveTab("checkout")}
            className={`w-full md:w-36 py-3 px-5 rounded-full cursor-pointer transition-colors text-left ${
              activeTab === "checkout" ? "bg-white shadow-md" : "hover:bg-neutral-200/60"
            }`}
          >
            <p className="text-[11px] font-bold tracking-wider text-neutral-800 uppercase">Check out</p>
            <p className="truncate text-xs font-medium text-neutral-800">
              {filters.checkOut ? formatDate(new Date(`${filters.checkOut}T00:00:00`)) : "Add dates"}
            </p>
          </button>

          {/* Who & Submit */}
          <div
            onClick={() => setActiveTab("who")}
            className={`w-full md:flex-1 py-2 px-5 pl-6 rounded-full cursor-pointer transition-colors flex items-center justify-between ${
              activeTab === "who" ? "bg-white shadow-md" : "hover:bg-neutral-200/60"
            }`}
          >
            <div>
              <p className="text-[11px] font-bold tracking-wider text-neutral-800 uppercase">Who</p>
              <p className="text-sm font-medium text-neutral-900">
                {filters.guests > 1 || pets > 0
                  ? `${filters.guests} guest${filters.guests === 1 ? "" : "s"}${pets ? `, ${pets} pet${pets === 1 ? "" : "s"}` : ""}`
                  : "Add guests"}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSearchSubmit();
              }}
              className="flex items-center gap-2 btn-airbnb-gradient text-white font-semibold text-sm px-5 py-3 rounded-full shadow-md ml-3"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Tab Dropdown Panel */}
        <div
          className={`mt-4 mx-auto bg-white rounded-[28px] border border-gray-200 shadow-xl animate-modal ${
            activeTab === "checkin" || activeTab === "checkout"
              ? "w-[min(1120px,calc(100vw-32px))] p-5 sm:p-8"
              : activeTab === "who"
              ? "w-[min(580px,calc(100vw-32px))] px-6 py-3 sm:px-8"
              : "max-w-xl p-5"
          }`}
        >
          {activeTab === "where" && (
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                Popular destinations
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUGGESTED_DESTINATIONS.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => handleDestinationSelect(d.query)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:border-black hover:bg-neutral-50 text-left text-xs font-medium transition-all"
                  >
                    <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{d.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "who" && (
            <div>
              {([
                ["Adults", "Ages 13 or above", adults, changeAdults, 1],
                ["Children", "Ages 2–12", children, changeChildren, 0],
                ["Infants", "Under 2", infants, setInfants, 0],
                ["Pets", "Bringing a service animal?", pets, setPets, 0],
              ] as const).map(([label, description, count, setCount, minimum], index) => (
                <div
                  key={label}
                  className={`flex items-center justify-between py-6 ${
                    index < 3 ? "border-b border-neutral-200" : ""
                  }`}
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
                      disabled={count <= minimum || (label === "Children" && adults + children <= 1)}
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
            </div>
          )}

          {(activeTab === "checkin" || activeTab === "checkout") && (
            <div>
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                {[visibleMonth, nextMonth].map((month, monthIndex) => (
                  <section
                    key={`${month.getFullYear()}-${month.getMonth()}`}
                    aria-label={month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  >
                    <div className="relative mb-5 flex h-10 items-center justify-center">
                      {monthIndex === 0 && (
                        <button
                          type="button"
                          aria-label="Previous month"
                          disabled={month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()}
                          onClick={() => moveMonth(-1)}
                          className="absolute left-0 rounded-full p-2 hover:bg-neutral-100 disabled:opacity-25 disabled:hover:bg-transparent"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      )}
                      <h3 className="text-[17px] font-semibold text-neutral-800">
                        {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </h3>
                      {monthIndex === 1 && (
                        <button
                          type="button"
                          aria-label="Next month"
                          onClick={() => moveMonth(1)}
                          className="absolute right-0 rounded-full p-2 hover:bg-neutral-100"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div className="mb-2 grid grid-cols-7">
                      {WEEKDAYS.map((weekday) => (
                        <span key={weekday} className="flex h-8 items-center justify-center text-xs font-medium text-neutral-500">
                          {weekday}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {getMonthDays(month).map((day, index) => {
                        if (!day) return <span key={`empty-${index}`} className="h-10 sm:h-12" />;
                        const value = dateToInputValue(day);
                        const isPast = day < today;
                        const isSelected = value === filters.checkIn || value === filters.checkOut;
                        const isInRange = Boolean(filters.checkIn && filters.checkOut && value > filters.checkIn && value < filters.checkOut);
                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={isPast}
                            onClick={() => selectDate(day)}
                            aria-pressed={isSelected}
                            className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors sm:h-12 sm:w-12 ${
                              isSelected
                                ? "bg-neutral-900 text-white"
                                : isInRange
                                ? "bg-neutral-100 text-neutral-900"
                                : isPast
                                ? "cursor-not-allowed text-neutral-300"
                                : "text-neutral-800 hover:border hover:border-neutral-800"
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
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
        </div>
      </div>
    </div>
  );
}
