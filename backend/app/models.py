from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base

# Association table for Listing <-> Amenity Many-to-Many
listing_amenity_association = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_superhost = Column(Boolean, default=False)
    host_bio = Column(Text, nullable=True)
    joined_year = Column(Integer, default=2021)
    role = Column(String(50), default="guest")  # "guest" or "host"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    hosted_listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    hosted_experiences = relationship("Experience", back_populates="host", cascade="all, delete-orphan")
    provided_services = relationship("Service", back_populates="provider", cascade="all, delete-orphan")

class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(50), nullable=False)  # Lucide icon name, e.g. "Wifi", "Tv", "Pool"
    category = Column(String(50), default="Basics")  # "Basics", "Standout", "Safety"

    listings = relationship("Listing", secondary=listing_amenity_association, back_populates="amenities")

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    property_type = Column(String(100), default="Entire place")  # "Entire villa", "Entire cabin", etc.
    category = Column(String(100), index=True, nullable=False)  # "Amazing pools", "Beachfront", etc.
    address = Column(String(255), nullable=False)
    city = Column(String(100), index=True, nullable=False)
    country = Column(String(100), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    price_per_night = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=50.0)
    service_fee = Column(Float, default=35.0)
    max_guests = Column(Integer, default=2)
    bedrooms = Column(Integer, default=1)
    beds = Column(Integer, default=1)
    bathrooms = Column(Float, default=1.0)
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    is_superhost = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    host = relationship("User", back_populates="hosted_listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.display_order")
    amenities = relationship("Amenity", secondary=listing_amenity_association, back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan", order_by="desc(Review.created_at)")
    wishlists = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")

class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    caption = Column(String(200), nullable=True)
    display_order = Column(Integer, default=0)

    listing = relationship("Listing", back_populates="images")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_code = Column(String(20), unique=True, index=True, nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests_count = Column(Integer, default=1)
    nightly_rate = Column(Float, nullable=False)
    total_nights = Column(Integer, nullable=False)
    cleaning_fee = Column(Float, default=0.0)
    service_fee = Column(Float, default=0.0)
    total_price = Column(Float, nullable=False)
    status = Column(String(50), default="confirmed")  # "confirmed", "cancelled", "completed"
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, nullable=False)
    cleanliness = Column(Float, default=5.0)
    accuracy = Column(Float, default=5.0)
    check_in_rating = Column(Float, default=5.0)
    communication = Column(Float, default=5.0)
    location_rating = Column(Float, default=5.0)
    value_rating = Column(Float, default=5.0)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wishlists")
    listing = relationship("Listing", back_populates="wishlists")

class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(250), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Culture & Sights", index=True)
    badge = Column(String(100), default="Available this week")
    is_original = Column(Boolean, default=False, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    country = Column(String(100), index=True, nullable=False)
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    price_per_person = Column(Float, nullable=False)
    duration_hours = Column(Float, default=2.5)
    group_size = Column(Integer, default=10)
    language = Column(String(100), default="English")
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    image_url = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    host = relationship("User", back_populates="hosted_experiences")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(250), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Dining & Chefs", index=True)
    service_type = Column(String(100), default="In-Residence")
    city = Column(String(100), index=True, nullable=True)
    country = Column(String(100), index=True, nullable=True)
    location = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String(50), default="hour")  # "hour", "session", "trip", "service", "tasting"
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    image_url = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    provider = relationship("User", back_populates="provided_services")
