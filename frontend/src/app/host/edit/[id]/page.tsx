"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Amenity, ListingDetail } from "@/types";
import { getListingById, getAmenities, updateListing } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { ChevronLeft, Plus, Trash2, Check } from "lucide-react";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.id);

  const { currentUser, addToast } = useApp();
  const hostId = currentUser?.role === "host" ? currentUser.id : 2;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [lData, amList] = await Promise.all([
          getListingById(listingId),
          getAmenities(),
        ]);
        setAvailableAmenities(amList);

        setTitle(lData.title);
        setDescription(lData.description);
        setPropertyType(lData.property_type);
        setCategory(lData.category);
        setAddress(lData.address);
        setCity(lData.city);
        setCountry(lData.country);
        setPricePerNight(lData.price_per_night);
        setCleaningFee(lData.cleaning_fee);
        setMaxGuests(lData.max_guests);
        setBedrooms(lData.bedrooms);
        setBeds(lData.beds);
        setBathrooms(lData.bathrooms);
        setSelectedAmenities(lData.amenities.map((a) => a.id));
        setImages(lData.images.map((img) => img.image_url));
      } catch (err) {
        console.error("Failed to load listing for editing", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [listingId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        property_type: propertyType,
        category,
        address,
        city,
        country,
        price_per_night: Number(pricePerNight),
        cleaning_fee: Number(cleaningFee),
        max_guests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        beds: Number(beds),
        bathrooms: Number(bathrooms),
        amenity_ids: selectedAmenities,
        images,
      };

      await updateListing(listingId, payload, hostId);
      addToast("Listing details updated successfully!", "success");
      router.push("/host");
    } catch (err: any) {
      addToast(err.message || "Failed to update listing", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded-md w-1/3 mb-6" />
        <div className="h-64 bg-neutral-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/host" className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-neutral-800" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Edit Listing</h1>
          <p className="text-xs sm:text-sm text-neutral-500">Update property info, pricing, photos and amenities.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-neutral-900 border-b pb-3">Basic Details</h2>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Description</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Property Type</label>
              <input
                type="text"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Category</label>
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

        {/* Pricing & Spaces */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-neutral-900 border-b pb-3">Pricing & Spaces</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Nightly Price ($)</label>
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
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Cleaning Fee ($)</label>
              <input
                type="number"
                min="0"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Max Guests</label>
              <input
                type="number"
                min="1"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Bedrooms</label>
              <input
                type="number"
                min="1"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-neutral-900 border-b pb-3">Photos ({images.length})</h2>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Add photo URL"
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => (
              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group bg-neutral-100 border">
                <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
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
            {submitting ? "Saving changes..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
