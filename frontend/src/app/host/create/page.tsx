"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Amenity } from "@/types";
import { getAmenities, createListing } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

const PHOTO_PRESETS = {
  villa: [
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
  ],
  chalet: [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80",
  ],
  beach: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80",
  ],
};

export default function CreateListingPage() {
  const router = useRouter();
  const { currentUser, addToast } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("Entire villa");
  const [category, setCategory] = useState("Amazing pools");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [pricePerNight, setPricePerNight] = useState<number>(350);
  const [cleaningFee, setCleaningFee] = useState<number>(60);
  const [maxGuests, setMaxGuests] = useState<number>(4);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [beds, setBeds] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2.0);

  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([1, 2, 4, 6]);

  const [images, setImages] = useState<string[]>([...PHOTO_PRESETS.villa]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const amList = await getAmenities();
        setAvailableAmenities(amList);
      } catch (err) {
        console.error("Could not fetch amenities", err);
      }
    }
    load();
  }, []);

  const toggleAmenity = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleAddCustomImage = () => {
    if (customImageUrl.trim()) {
      setImages((prev) => [...prev, customImageUrl.trim()]);
      setCustomImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyPreset = (presetKey: keyof typeof PHOTO_PRESETS) => {
    setImages(PHOTO_PRESETS[presetKey]);
    addToast(`Applied ${presetKey} photo preset!`, "info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !city || !country || images.length === 0) {
      addToast("Please fill in all required fields and provide at least one photo.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        property_type: propertyType,
        category,
        address: address || `${city} Center`,
        city,
        country,
        latitude: 37.0 + Math.random() * 5,
        longitude: 15.0 + Math.random() * 10,
        price_per_night: Number(pricePerNight),
        cleaning_fee: Number(cleaningFee),
        service_fee: Math.round(Number(pricePerNight) * 0.14),
        max_guests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        beds: Number(beds),
        bathrooms: Number(bathrooms),
        amenity_ids: selectedAmenities,
        images,
      };

      const hostId = currentUser?.role === "host" ? currentUser.id : 2;
      const created = await createListing(payload, hostId);
      addToast(`🎉 Listing "${created.title}" successfully published!`, "success");
      router.push("/host");
    } catch (err: any) {
      addToast(err.message || "Failed to create listing", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/host" className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-neutral-800" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Create a New Listing</h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Publish your property to millions of Airbnb travelers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section 1: Overview */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-neutral-900 border-b pb-3">1. Basic Details</h2>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
              Listing Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Cliffside Villa with Heated Pool"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe your space, amenities, ambiance, neighborhood, and unique features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-black bg-white"
              >
                <option value="Entire villa">Entire villa</option>
                <option value="Entire chalet">Entire chalet</option>
                <option value="Entire apartment">Entire apartment</option>
                <option value="Entire cabin">Entire cabin</option>
                <option value="Entire loft">Entire loft</option>
                <option value="Entire estate">Entire estate</option>
                <option value="Entire treehouse">Entire treehouse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-black bg-white"
              >
                <option value="Amazing pools">Amazing pools</option>
                <option value="Beachfront">Beachfront</option>
                <option value="Cabins">Cabins</option>
                <option value="Mansions">Mansions</option>
                <option value="Luxe">Luxe</option>
                <option value="Iconic cities">Iconic cities</option>
                <option value="Lakefront">Lakefront</option>
                <option value="Countryside">Countryside</option>
                <option value="Tropical">Tropical</option>
                <option value="Design">Design</option>
                <option value="Treehouses">Treehouses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-neutral-900 border-b pb-3">2. Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Santorini"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Country *</label>
              <input
                type="text"
                required
                placeholder="e.g. Greece"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Address</label>
            <input
              type="text"
              placeholder="e.g. Caldera Cliff Way 12"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Section 3: Pricing & Capacity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-neutral-900 border-b pb-3">3. Pricing & Spaces</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Nightly Price ($) *
              </label>
              <input
                type="number"
                min="10"
                required
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Cleaning Fee ($)
              </label>
              <input
                type="number"
                min="0"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Max Guests
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Amenities */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 border-b pb-3">4. Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableAmenities.map((amenity) => {
              const checked = selectedAmenities.includes(amenity.id);
              return (
                <button
                  type="button"
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                    checked
                      ? "border-black bg-neutral-50 text-neutral-900 font-semibold"
                      : "border-gray-200 hover:border-gray-300 text-neutral-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      checked ? "bg-black border-black text-white" : "border-gray-300 bg-white"
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{amenity.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Photos */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">5. Photos ({images.length})</h2>
              <p className="text-xs text-neutral-500">Add URLs or click presets to instantly seed high-res photos.</p>
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset("villa")}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200"
              >
                Villa
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("chalet")}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200"
              >
                Chalet
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("beach")}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200"
              >
                Beach
              </button>
            </div>
          </div>

          {/* Add custom URL */}
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste image URL (https://images.unsplash.com/...)"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={handleAddCustomImage}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL</span>
            </button>
          </div>

          {/* Photos Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => (
              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group bg-neutral-100 border">
                <img src={imgUrl} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Cover Photo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/host"
            className="px-6 py-3 rounded-xl border border-gray-300 text-sm font-semibold hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn-airbnb-gradient text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 transition-all"
          >
            {submitting ? "Publishing listing..." : "Publish listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
