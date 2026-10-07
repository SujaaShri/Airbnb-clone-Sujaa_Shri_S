"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Bus,
  ChevronDown,
  ChevronUp,
  Clock3,
  CookingPot,
  Flower2,
  Landmark,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";

export interface ExperienceBrowseFilters {
  originals: boolean;
  featured: string[];
  types: string[];
  goodFor: string[];
  times: string[];
  languages: string[];
  accessibility: string[];
  minPrice: number | null;
  maxPrice: number | null;
  maxDuration: number;
}

interface ExperienceFiltersProps {
  value: ExperienceBrowseFilters;
  resultCount: number;
  onChange: (value: ExperienceBrowseFilters) => void;
}

const EXPERIENCE_TYPES = [
  { label: "Architecture", icon: Building2 },
  { label: "Art workshops", icon: Palette },
  { label: "Beauty", icon: Flower2 },
  { label: "Cooking", icon: CookingPot },
  { label: "Cultural tours", icon: Landmark },
  { label: "Dining", icon: Utensils },
  { label: "Flying", icon: Sparkles },
  { label: "Food tours", icon: Bus },
  { label: "Galleries", icon: Palette },
  { label: "Landmarks", icon: Landmark },
  { label: "Museums", icon: Building2 },
  { label: "Outdoors", icon: Flower2 },
  { label: "Performances", icon: Sparkles },
  { label: "Shopping & fashion", icon: Sparkles },
  { label: "Tastings", icon: Utensils },
  { label: "Water sports", icon: Sparkles },
  { label: "Wellness", icon: Flower2 },
  { label: "Wildlife", icon: Flower2 },
  { label: "Workouts", icon: Sparkles },
];

const TIME_OPTIONS = [
  { label: "Morning", detail: "Before 12:00" },
  { label: "Afternoon", detail: "Between 12:00 and 17:00" },
  { label: "Evening", detail: "After 17:00" },
];

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function hasActiveFilters(value: ExperienceBrowseFilters) {
  return value.originals || value.featured.length > 0 || value.types.length > 0 || value.goodFor.length > 0 || value.times.length > 0 ||
    value.languages.length > 0 || value.accessibility.length > 0 ||
    value.minPrice !== null || value.maxPrice !== null || value.maxDuration < 6;
}

export default function ExperienceFilters({
  value,
  resultCount,
  onChange,
}: ExperienceFiltersProps) {
  const [openPanel, setOpenPanel] = useState<"type" | "time" | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState(value);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const openFilters = () => {
    setDraft(value);
    setMinPrice(value.minPrice?.toString() ?? "");
    setMaxPrice(value.maxPrice?.toString() ?? "");
    setShowModal(true);
  };

  const emptyFilters: ExperienceBrowseFilters = {
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
  };

  const clearAll = () => {
    const cleared = emptyFilters;
    onChange(cleared);
    setDraft(cleared);
    setMinPrice("");
    setMaxPrice("");
  };

  const applyDraft = () => {
    onChange({
      ...draft,
      minPrice: minPrice === "" ? null : Number(minPrice),
      maxPrice: maxPrice === "" ? null : Number(maxPrice),
    });
    setShowModal(false);
    setOpenPanel(null);
  };

  const resultsFooter = (clearLabel: string, onClear: () => void = clearAll) => (
    <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-4">
      <button
        type="button"
        onClick={onClear}
        className="text-sm font-semibold text-neutral-400 hover:text-neutral-800"
      >
        {clearLabel}
      </button>
      <button
        type="button"
        onClick={() => showModal ? applyDraft() : setOpenPanel(null)}
        className="rounded-xl bg-[#222] px-5 py-3 text-sm font-semibold text-white hover:bg-black"
      >
        {resultCount ? `Show ${resultCount} results` : "No results available"}
      </button>
    </div>
  );

  return (
    <>
      <div className="relative z-10 mb-6 flex flex-wrap items-center gap-3 py-1">
        <button
          type="button"
          onClick={openFilters}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm hover:border-neutral-900 ${
            hasActiveFilters(value) ? "border-neutral-900" : "border-neutral-300"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        <span className="h-7 w-px shrink-0 bg-neutral-200" />
        <button
          type="button"
          aria-pressed={value.originals}
          onClick={() => onChange({ ...value, originals: !value.originals })}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
            value.originals ? "border-neutral-900 bg-neutral-50" : "border-neutral-300 hover:border-neutral-900"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Originals
        </button>
        <div className="relative shrink-0">
          <button
            type="button"
            aria-expanded={openPanel === "type"}
            onClick={() => setOpenPanel(openPanel === "type" ? null : "type")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
              openPanel === "type" || value.types.length ? "border-neutral-900" : "border-neutral-300"
            }`}
          >
            Type
            {openPanel === "type" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {openPanel === "type" && (
            <div className="absolute left-0 top-full z-30 mt-3 w-[min(520px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
              <div className="grid max-h-[min(460px,65vh)] grid-cols-2 gap-3 overflow-y-auto p-6">
                {EXPERIENCE_TYPES.map(({ label, icon: Icon }) => {
                  const selected = value.types.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onChange({ ...value, types: toggleValue(value.types, label) })}
                      className={`flex min-h-12 items-center gap-3 rounded-full border px-4 py-2 text-left text-sm transition-colors ${
                        selected ? "border-neutral-900 bg-neutral-50" : "border-neutral-300 hover:border-neutral-900"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  );
                })}
              </div>
              {resultsFooter("Clear", () => onChange({ ...value, types: [] }))}
            </div>
          )}
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            aria-expanded={openPanel === "time"}
            onClick={() => setOpenPanel(openPanel === "time" ? null : "time")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
              openPanel === "time" || value.times.length ? "border-neutral-900" : "border-neutral-300"
            }`}
          >
            Time of day
            {openPanel === "time" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {openPanel === "time" && (
            <div className="absolute left-0 top-full z-30 mt-3 w-[min(470px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
              <div className="p-6">
                {TIME_OPTIONS.map(({ label, detail }) => (
                  <label key={label} className="flex cursor-pointer items-center gap-4 py-3">
                    <input
                      type="checkbox"
                      checked={value.times.includes(label)}
                      onChange={() => onChange({ ...value, times: toggleValue(value.times, label) })}
                      className="h-6 w-6 accent-neutral-900"
                    />
                    <span>
                      <span className="block font-semibold">{label}</span>
                      <span className="text-sm text-neutral-500">{detail}</span>
                    </span>
                  </label>
                ))}
              </div>
              {resultsFooter("Clear", () => onChange({ ...value, times: [] }))}
            </div>
          )}
        </div>
      </div>

      {showModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-0 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <section
            aria-label="Experience filters"
            className="flex max-h-[min(790px,100dvh)] w-full max-w-[680px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
          >
            <header className="relative flex h-[72px] shrink-0 items-center justify-center border-b border-neutral-200 px-6">
              <h2 className="font-semibold">Filters</h2>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setShowModal(false)}
                className="absolute right-6 rounded-full p-2 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 space-y-7 overflow-y-auto px-7 py-6">
              <section className="border-b border-neutral-200 pb-7">
                <h3 className="mb-4 text-xl font-semibold">Featured</h3>
                <div className="flex flex-wrap gap-2">
                  {["Food culture", "Day trips"].map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      aria-pressed={draft.featured.includes(feature)}
                      onClick={() => setDraft({ ...draft, featured: toggleValue(draft.featured, feature) })}
                      className={`rounded-full border px-5 py-3 text-sm ${
                        draft.featured.includes(feature) ? "border-neutral-900 bg-neutral-50" : "border-neutral-300"
                      }`}
                    >
                      {feature === "Food culture"
                        ? <CookingPot className="mr-2 inline h-4 w-4" />
                        : <Bus className="mr-2 inline h-4 w-4" />}
                      {feature}
                    </button>
                  ))}
                </div>
              </section>
              <section className="border-b border-neutral-200 pb-7">
                <h3 className="mb-4 text-xl font-semibold">Experience type</h3>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_TYPES.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={draft.types.includes(label)}
                      onClick={() => setDraft({ ...draft, types: toggleValue(draft.types, label) })}
                      className={`rounded-full border px-4 py-2.5 text-sm ${
                        draft.types.includes(label) ? "border-neutral-900 bg-neutral-50" : "border-neutral-300"
                      }`}
                    >
                      <Icon className="mr-2 inline h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </section>
              <section className="border-b border-neutral-200 pb-7">
                <h3 className="mb-4 text-xl font-semibold">Good for</h3>
                <div className="flex flex-wrap gap-2">
                  {["Kids", "Big groups", "Going solo", "Couples", "First timers", "Locals"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={draft.goodFor.includes(label)}
                      onClick={() => setDraft({ ...draft, goodFor: toggleValue(draft.goodFor, label) })}
                      className={`rounded-full border px-4 py-2.5 text-sm ${
                        draft.goodFor.includes(label) ? "border-neutral-900 bg-neutral-50" : "border-neutral-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>
              <section className="border-b border-neutral-200 pb-7">
                <h3 className="text-xl font-semibold">Price per guest</h3>
                <p className="mt-1 text-sm text-neutral-500">Prices before fees and taxes</p>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <label className="rounded-2xl border border-neutral-300 px-4 py-3 text-xs text-neutral-500">
                    Minimum
                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                      placeholder="₹96"
                      className="mt-1 block w-full bg-transparent text-base text-neutral-900 outline-none"
                    />
                  </label>
                  <label className="rounded-2xl border border-neutral-300 px-4 py-3 text-xs text-neutral-500">
                    Maximum
                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      placeholder="₹9640+"
                      className="mt-1 block w-full bg-transparent text-base text-neutral-900 outline-none"
                    />
                  </label>
                </div>
              </section>
              <section className="border-b border-neutral-200 pb-7">
                <h3 className="mb-5 text-xl font-semibold">Duration</h3>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-neutral-500" />
                  <input
                    type="range"
                    min="0.5"
                    max="6"
                    step="0.5"
                    value={draft.maxDuration}
                    onChange={(event) => setDraft({ ...draft, maxDuration: Number(event.target.value) })}
                    className="w-full accent-neutral-900"
                    aria-label="Maximum experience duration in hours"
                  />
                  <span className="w-14 text-right text-sm">{draft.maxDuration >= 6 ? "5h+" : `${draft.maxDuration}h`}</span>
                </div>
              </section>
              <section className="pb-3">
                <h3 className="mb-3 text-xl font-semibold">Time of day</h3>
                {TIME_OPTIONS.map(({ label, detail }) => (
                  <label key={label} className="flex cursor-pointer items-center gap-4 py-3">
                    <input
                      type="checkbox"
                      checked={draft.times.includes(label)}
                      onChange={() => setDraft({ ...draft, times: toggleValue(draft.times, label) })}
                      className="h-6 w-6 accent-neutral-900"
                    />
                    <span>
                      <span className="block font-semibold">{label}</span>
                      <span className="text-sm text-neutral-500">{detail}</span>
                    </span>
                  </label>
                ))}
              </section>
              <section className="border-t border-neutral-200 py-6">
                <h3 className="mb-4 text-xl font-semibold">Language offered</h3>
                <div className="grid grid-cols-2 gap-4">
                  {["English", "French", "German", "Japanese"].map((language) => (
                    <label key={language} className="flex cursor-pointer items-center gap-3 py-2">
                      <input
                        type="checkbox"
                        checked={draft.languages.includes(language)}
                        onChange={() => setDraft({ ...draft, languages: toggleValue(draft.languages, language) })}
                        className="h-6 w-6 accent-neutral-900"
                      />
                      {language}
                    </label>
                  ))}
                </div>
                <h3 className="mb-4 mt-8 text-xl font-semibold">Accessibility features</h3>
                <div className="space-y-3">
                  {["Step-free access", "Sign language options", "Designated sighted guide", "No extreme sensory stimuli"].map((feature) => (
                    <label key={feature} className="flex cursor-pointer items-center gap-3 py-2">
                      <input
                        type="checkbox"
                        checked={draft.accessibility.includes(feature)}
                        onChange={() => setDraft({ ...draft, accessibility: toggleValue(draft.accessibility, feature) })}
                        className="h-6 w-6 accent-neutral-900"
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </section>
            </div>
            <footer className="shrink-0 border-t border-neutral-200">
              {resultsFooter("Clear all", () => {
                setDraft(emptyFilters);
                setMinPrice("");
                setMaxPrice("");
              })}
            </footer>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}
