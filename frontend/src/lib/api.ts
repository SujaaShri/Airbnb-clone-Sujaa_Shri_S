import {
  ListingSummary,
  ListingDetail,
  Booking,
  HostStats,
  HostListingItem,
  Category,
  Amenity,
  User,
  FilterState,
  Review,
  Experience,
  Service,
  UnifiedSearchResult
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `API Error: ${res.status} ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorMsg = errJson.detail;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

// ----------------- Listings -----------------
export async function getListings(
  filters: Partial<FilterState> = {},
  userId: number = 1
): Promise<ListingSummary[]> {
  const params = new URLSearchParams();

  if (filters.location) params.append("location", filters.location);
  if (filters.category && filters.category !== "all") params.append("category", filters.category);
  if (filters.checkIn && filters.checkOut) {
    params.append("check_in", filters.checkIn);
    params.append("check_out", filters.checkOut);
  }
  if (filters.guests && filters.guests > 1) params.append("guests", filters.guests.toString());
  if (filters.minPrice !== null && filters.minPrice !== undefined) params.append("min_price", filters.minPrice.toString());
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) params.append("max_price", filters.maxPrice.toString());
  if (filters.propertyType && filters.propertyType !== "any") params.append("property_type", filters.propertyType);
  if (filters.bedrooms && filters.bedrooms > 0) params.append("bedrooms", filters.bedrooms.toString());
  if (filters.amenities && filters.amenities.length > 0) params.append("amenities", filters.amenities.join(","));
  if (filters.sortBy) params.append("sort_by", filters.sortBy);
  if (userId) params.append("user_id", userId.toString());

  const url = `${API_BASE_URL}/api/listings?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<ListingSummary[]>(res);
}

export async function getListingById(id: number, userId: number = 1): Promise<ListingDetail> {
  const url = `${API_BASE_URL}/api/listings/${id}?user_id=${userId}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<ListingDetail>(res);
}

export async function createListing(data: any, hostId: number = 2): Promise<ListingDetail> {
  const url = `${API_BASE_URL}/api/listings?host_id=${hostId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<ListingDetail>(res);
}

export async function updateListing(id: number, data: any, hostId: number = 2): Promise<ListingDetail> {
  const url = `${API_BASE_URL}/api/listings/${id}?host_id=${hostId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<ListingDetail>(res);
}

export async function deleteListing(id: number, hostId: number = 2): Promise<{ message: string; id: number }> {
  const url = `${API_BASE_URL}/api/listings/${id}?host_id=${hostId}`;
  const res = await fetch(url, { method: "DELETE" });
  return handleResponse<{ message: string; id: number }>(res);
}

// ----------------- Categories & Amenities -----------------
export async function getCategories(): Promise<Category[]> {
  const url = `${API_BASE_URL}/api/categories`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<Category[]>(res);
}

export async function getAmenities(): Promise<Amenity[]> {
  const url = `${API_BASE_URL}/api/amenities`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<Amenity[]>(res);
}

// ----------------- Bookings -----------------
export async function createBooking(
  bookingData: {
    listing_id: number;
    check_in: string;
    check_out: string;
    guests_count: number;
  },
  guestId: number = 1
): Promise<Booking> {
  const url = `${API_BASE_URL}/api/bookings?guest_id=${guestId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  return handleResponse<Booking>(res);
}

export async function checkoutBooking(
  bookingId: number,
  paymentMethod: "card" | "paypal" | "apple_pay",
  guestId: number = 1,
  cardLastFour?: string
): Promise<{
  success: boolean;
  booking_code: string;
  message: string;
  confirmation_number: string;
  total_charged: number;
}> {
  const url = `${API_BASE_URL}/api/bookings/checkout?guest_id=${guestId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      booking_id: bookingId,
      payment_method: paymentMethod,
      card_last_four: cardLastFour,
    }),
  });
  return handleResponse(res);
}

export async function getMyTrips(guestId: number = 1): Promise<Booking[]> {
  const url = `${API_BASE_URL}/api/bookings/my?guest_id=${guestId}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<Booking[]>(res);
}

export async function cancelBooking(bookingId: number, guestId: number = 1): Promise<{ message: string }> {
  const url = `${API_BASE_URL}/api/bookings/${bookingId}?guest_id=${guestId}`;
  const res = await fetch(url, { method: "DELETE" });
  return handleResponse<{ message: string }>(res);
}

// ----------------- Host Dashboard -----------------
export async function getHostStats(hostId: number = 2): Promise<HostStats> {
  const url = `${API_BASE_URL}/api/host/stats?host_id=${hostId}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<HostStats>(res);
}

export async function getHostListings(hostId: number = 2): Promise<HostListingItem[]> {
  const url = `${API_BASE_URL}/api/host/listings?host_id=${hostId}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<HostListingItem[]>(res);
}

export async function getHostReservations(hostId: number = 2): Promise<Booking[]> {
  const url = `${API_BASE_URL}/api/host/reservations?host_id=${hostId}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<Booking[]>(res);
}

// ----------------- Reviews -----------------
export async function submitReview(
  listingId: number,
  reviewData: {
    rating: number;
    cleanliness: number;
    accuracy: number;
    check_in_rating: number;
    communication: number;
    location_rating: number;
    value_rating: number;
    comment: string;
  },
  userId: number = 1
): Promise<Review> {
  const url = `${API_BASE_URL}/api/listings/${listingId}/reviews?user_id=${userId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  });
  return handleResponse<Review>(res);
}

// ----------------- Wishlists -----------------
export async function getWishlists(userId: number = 1): Promise<ListingSummary[]> {
  const url = `${API_BASE_URL}/api/wishlists?user_id=${userId}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<ListingSummary[]>(res);
}

export async function getWishlistIds(userId: number = 1): Promise<number[]> {
  const url = `${API_BASE_URL}/api/wishlists/ids?user_id=${userId}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<number[]>(res);
}

export async function toggleWishlist(
  listingId: number,
  userId: number = 1
): Promise<{ listing_id: number; is_wishlisted: boolean; message: string }> {
  const url = `${API_BASE_URL}/api/wishlists/${listingId}?user_id=${userId}`;
  const res = await fetch(url, { method: "POST" });
  return handleResponse<{ listing_id: number; is_wishlisted: boolean; message: string }>(res);
}

// ----------------- Users -----------------
export async function getUsers(): Promise<User[]> {
  const url = `${API_BASE_URL}/api/users`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<User[]>(res);
}

// ----------------- Experiences -----------------
export async function getExperiences(params: {
  location?: string;
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
} = {}): Promise<Experience[]> {
  const queryParams = new URLSearchParams();
  if (params.location) queryParams.append("location", params.location);
  if (params.category && params.category !== "all") queryParams.append("category", params.category);
  if (params.search) queryParams.append("search", params.search);
  if (params.min_price !== undefined) queryParams.append("min_price", params.min_price.toString());
  if (params.max_price !== undefined) queryParams.append("max_price", params.max_price.toString());
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);

  const url = `${API_BASE_URL}/api/experiences?${queryParams.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<Experience[]>(res);
}

export async function getExperienceById(id: number): Promise<Experience> {
  const url = `${API_BASE_URL}/api/experiences/${id}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<Experience>(res);
}

// ----------------- Services -----------------
export async function getServices(params: {
  location?: string;
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
} = {}): Promise<Service[]> {
  const queryParams = new URLSearchParams();
  if (params.location) queryParams.append("location", params.location);
  if (params.category && params.category !== "all") queryParams.append("category", params.category);
  if (params.search) queryParams.append("search", params.search);
  if (params.min_price !== undefined) queryParams.append("min_price", params.min_price.toString());
  if (params.max_price !== undefined) queryParams.append("max_price", params.max_price.toString());
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);

  const url = `${API_BASE_URL}/api/services?${queryParams.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<Service[]>(res);
}

export async function getServiceById(id: number): Promise<Service> {
  const url = `${API_BASE_URL}/api/services/${id}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<Service>(res);
}

// ----------------- Unified Search -----------------
export async function unifiedSearch(params: {
  q?: string;
  location?: string;
  tab?: "all" | "homes" | "experiences" | "services";
  category?: string;
  min_price?: number;
  max_price?: number;
  guests?: number;
  user_id?: number;
} = {}): Promise<UnifiedSearchResult> {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.append("q", params.q);
  if (params.location) queryParams.append("location", params.location);
  if (params.tab) queryParams.append("tab", params.tab);
  if (params.category && params.category !== "all") queryParams.append("category", params.category);
  if (params.min_price !== undefined) queryParams.append("min_price", params.min_price.toString());
  if (params.max_price !== undefined) queryParams.append("max_price", params.max_price.toString());
  if (params.guests && params.guests > 1) queryParams.append("guests", params.guests.toString());
  if (params.user_id) queryParams.append("user_id", params.user_id.toString());

  const url = `${API_BASE_URL}/api/search?${queryParams.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<UnifiedSearchResult>(res);
}
