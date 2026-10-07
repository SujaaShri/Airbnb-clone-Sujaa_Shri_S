from datetime import datetime, date
from typing import List, Literal, Optional, Any
from pydantic import BaseModel, Field, model_validator

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    name: str
    email: str
    avatar_url: Optional[str] = None
    is_superhost: bool = False
    host_bio: Optional[str] = None
    joined_year: int = 2022
    role: str = "guest"

class UserCreate(BaseModel):
    name: str
    email: str
    avatar_url: Optional[str] = None
    host_bio: Optional[str] = None
    role: str = "guest"

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Amenity Schemas -----------------
class AmenityResponse(BaseModel):
    id: int
    name: str
    icon: str
    category: str

    class Config:
        from_attributes = True

# ----------------- Image Schemas -----------------
class ListingImageBase(BaseModel):
    image_url: str
    caption: Optional[str] = None
    display_order: int = 0

class ListingImageResponse(ListingImageBase):
    id: int
    listing_id: int

    class Config:
        from_attributes = True

# ----------------- Review Schemas -----------------
class ReviewCreate(BaseModel):
    rating: float = Field(..., ge=1, le=5)
    cleanliness: float = Field(5.0, ge=1, le=5)
    accuracy: float = Field(5.0, ge=1, le=5)
    check_in_rating: float = Field(5.0, ge=1, le=5)
    communication: float = Field(5.0, ge=1, le=5)
    location_rating: float = Field(5.0, ge=1, le=5)
    value_rating: float = Field(5.0, ge=1, le=5)
    comment: str

class ReviewResponse(BaseModel):
    id: int
    listing_id: int
    user_id: int
    user: UserResponse
    rating: float
    cleanliness: float
    accuracy: float
    check_in_rating: float
    communication: float
    location_rating: float
    value_rating: float
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Booking Schemas -----------------
class BookingRequestBase(BaseModel):
    listing_id: int = Field(gt=0)
    check_in: date
    check_out: date
    guests_count: int = Field(default=1, ge=1, le=30)

    @model_validator(mode="after")
    def validate_stay_dates(self):
        if self.check_in < date.today():
            raise ValueError("Check-in date cannot be in the past.")
        if self.check_in >= self.check_out:
            raise ValueError("Check-out date must be after check-in date.")
        return self


class BookingCreate(BookingRequestBase):
    pass


class BookingPricePreview(BookingRequestBase):
    pass

class BookingPriceResponse(BaseModel):
    listing_id: int
    listing_title: str
    check_in: date
    check_out: date
    guests_count: int
    total_nights: int
    nightly_rate: float
    nightly_total: float
    cleaning_fee: float
    service_fee: float
    total_price: float
    is_available: bool
    message: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    booking_code: str
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests_count: int
    nightly_rate: float
    total_nights: int
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: str
    created_at: datetime
    listing_title: Optional[str] = None
    listing_city: Optional[str] = None
    listing_country: Optional[str] = None
    listing_image: Optional[str] = None
    host_name: Optional[str] = None

    class Config:
        from_attributes = True

class BookedDateRange(BaseModel):
    check_in: str
    check_out: str

# ----------------- Listing Schemas -----------------
class ListingBase(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    description: str = Field(min_length=20)
    property_type: str = "Entire place"
    category: str = Field(min_length=1, max_length=100)
    address: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    country: str = Field(min_length=1, max_length=100)
    latitude: float
    longitude: float
    price_per_night: float = Field(gt=0)
    cleaning_fee: float = Field(default=50.0, ge=0)
    service_fee: float = Field(default=35.0, ge=0)
    max_guests: int = Field(default=2, ge=1, le=30)
    bedrooms: int = Field(default=1, ge=0, le=100)
    beds: int = Field(default=1, ge=1, le=100)
    bathrooms: float = Field(default=1.0, gt=0, le=100)

class ListingCreate(ListingBase):
    amenity_ids: List[int] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list, max_length=20)

class ListingUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=5, max_length=200)
    description: Optional[str] = Field(default=None, min_length=20)
    property_type: Optional[str] = None
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    address: Optional[str] = Field(default=None, min_length=1, max_length=255)
    city: Optional[str] = Field(default=None, min_length=1, max_length=100)
    country: Optional[str] = Field(default=None, min_length=1, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: Optional[float] = Field(default=None, gt=0)
    cleaning_fee: Optional[float] = Field(default=None, ge=0)
    service_fee: Optional[float] = Field(default=None, ge=0)
    max_guests: Optional[int] = Field(default=None, ge=1, le=30)
    bedrooms: Optional[int] = Field(default=None, ge=0, le=100)
    beds: Optional[int] = Field(default=None, ge=1, le=100)
    bathrooms: Optional[float] = Field(default=None, gt=0, le=100)
    amenity_ids: Optional[List[int]] = None
    images: Optional[List[str]] = Field(default=None, max_length=20)

class ListingSummaryResponse(BaseModel):
    id: int
    title: str
    property_type: str
    category: str
    city: str
    country: str
    latitude: float
    longitude: float
    price_per_night: float
    rating: float
    review_count: int
    is_superhost: bool
    images: List[ListingImageResponse]
    is_wishlisted: bool = False

    class Config:
        from_attributes = True

class PaginatedListingsResponse(BaseModel):
    items: List[ListingSummaryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

class ListingDetailResponse(BaseModel):
    id: int
    title: str
    description: str
    property_type: str
    category: str
    address: str
    city: str
    country: str
    latitude: float
    longitude: float
    price_per_night: float
    cleaning_fee: float
    service_fee: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    rating: float
    review_count: int
    is_superhost: bool
    created_at: datetime
    updated_at: datetime
    host: UserResponse
    images: List[ListingImageResponse]
    amenities: List[AmenityResponse]
    reviews: List[ReviewResponse]
    booked_dates: List[BookedDateRange] = []
    is_wishlisted: bool = False

    class Config:
        from_attributes = True

# ----------------- Host Dashboard Schemas -----------------
class HostStatsResponse(BaseModel):
    total_listings: int
    total_bookings: int
    total_revenue: float
    average_rating: float

class HostListingItem(BaseModel):
    id: int
    title: str
    city: str
    country: str
    price_per_night: float
    rating: float
    review_count: int
    category: str
    image_url: Optional[str] = None
    bookings_count: int = 0
    total_revenue: float = 0.0
    created_at: datetime

# ----------------- Wishlist Schemas -----------------
class WishlistToggleResponse(BaseModel):
    listing_id: int
    is_wishlisted: bool
    message: str

# ----------------- Category Schema -----------------
class CategoryResponse(BaseModel):
    id: str
    label: str
    icon: str
    count: int

# ----------------- Search Suggestion Schema -----------------
class SearchSuggestion(BaseModel):
    type: str          # "city", "country", "listing"
    label: str
    sublabel: Optional[str] = None
    value: str

class SearchSuggestionsResponse(BaseModel):
    suggestions: List[SearchSuggestion]

# ----------------- Experience Schemas -----------------
class ExperienceResponse(BaseModel):
    id: int
    host_id: int
    title: str
    description: str
    category: str
    badge: str
    is_original: bool = False
    city: str
    country: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_person: float
    duration_hours: float
    group_size: int
    language: str
    rating: float
    review_count: int
    image_url: str
    is_wishlisted: bool = False
    created_at: datetime
    host: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# ----------------- Service Schemas -----------------
class ServiceResponse(BaseModel):
    id: int
    provider_id: int
    title: str
    description: str
    category: str
    service_type: str
    city: Optional[str] = None
    country: Optional[str] = None
    location: str
    price: float
    unit: str
    rating: float
    review_count: int
    image_url: str
    is_wishlisted: bool = False
    created_at: datetime
    provider: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# ----------------- Unified Search Schema -----------------
class UnifiedSearchResponse(BaseModel):
    query: str
    location: Optional[str] = None
    listings: List[ListingSummaryResponse] = []
    experiences: List[ExperienceResponse] = []
    services: List[ServiceResponse] = []
    total_listings: int = 0
    total_experiences: int = 0
    total_services: int = 0

# ----------------- Checkout Mock Schema -----------------
class CheckoutRequest(BaseModel):
    booking_id: int = Field(gt=0)
    payment_method: Literal["card", "paypal", "apple_pay"] = "card"
    card_last_four: Optional[str] = Field(default=None, pattern=r"^\d{4}$")

class CheckoutResponse(BaseModel):
    success: bool
    booking_code: str
    message: str
    confirmation_number: str
    total_charged: float
