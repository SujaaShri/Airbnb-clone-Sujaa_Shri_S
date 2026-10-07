export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  is_superhost: boolean;
  host_bio?: string;
  joined_year: number;
  role: "guest" | "host";
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  category: string;
}

export interface ListingImage {
  id: number;
  listing_id: number;
  image_url: string;
  caption?: string;
  display_order: number;
}

export interface Review {
  id: number;
  listing_id: number;
  user_id: number;
  user: User;
  rating: number;
  cleanliness: number;
  accuracy: number;
  check_in_rating: number;
  communication: number;
  location_rating: number;
  value_rating: number;
  comment: string;
  created_at: string;
}

export interface BookedDateRange {
  check_in: string;
  check_out: string;
}

export interface ListingSummary {
  id: number;
  title: string;
  property_type: string;
  category: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  rating: number;
  review_count: number;
  is_superhost: boolean;
  images: ListingImage[];
  is_wishlisted?: boolean;
}

export interface ListingDetail extends ListingSummary {
  description: string;
  address: string;
  cleaning_fee: number;
  service_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  created_at: string;
  updated_at: string;
  host: User;
  amenities: Amenity[];
  reviews: Review[];
  booked_dates: BookedDateRange[];
}

export interface Booking {
  id: number;
  booking_code: string;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  nightly_rate: number;
  total_nights: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: "confirmed" | "cancelled" | "completed";
  created_at: string;
  listing_title?: string;
  listing_city?: string;
  listing_country?: string;
  listing_image?: string;
  host_name?: string;
}

export interface HostStats {
  total_listings: number;
  total_bookings: number;
  total_revenue: number;
  average_rating: number;
}

export interface HostListingItem {
  id: number;
  title: string;
  city: string;
  country: string;
  price_per_night: number;
  rating: number;
  review_count: number;
  category: string;
  image_url?: string;
  bookings_count: number;
  total_revenue: number;
  created_at: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  count: number;
}

export interface FilterState {
  category: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice: number | null;
  maxPrice: number | null;
  propertyType: string;
  bedrooms: number | null;
  amenities: number[];
  sortBy: string;
}

export interface Experience {
  id: number;
  host_id: number;
  title: string;
  description: string;
  category: string;
  badge: string;
  is_original: boolean;
  city: string;
  country: string;
  location: string;
  latitude?: number;
  longitude?: number;
  price_per_person: number;
  duration_hours: number;
  group_size: number;
  language: string;
  rating: number;
  review_count: number;
  image_url: string;
  is_wishlisted?: boolean;
  created_at: string;
  host?: User;
}

export interface Service {
  id: number;
  provider_id: number;
  title: string;
  description: string;
  category: string;
  service_type: string;
  city?: string;
  country?: string;
  location: string;
  price: number;
  unit: string;
  rating: number;
  review_count: number;
  image_url: string;
  is_wishlisted?: boolean;
  created_at: string;
  provider?: User;
}

export interface UnifiedSearchResult {
  query: string;
  location?: string;
  listings: ListingSummary[];
  experiences: Experience[];
  services: Service[];
  total_listings: number;
  total_experiences: number;
  total_services: number;
}
