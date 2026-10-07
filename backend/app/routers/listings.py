import re
from math import ceil
from datetime import date
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, not_

from ..database import get_db
from ..models import Listing, ListingImage, Amenity, Booking, Review, Wishlist, User
from ..schemas import (
    ListingSummaryResponse,
    ListingDetailResponse,
    ListingCreate,
    ListingUpdate,
    BookedDateRange,
    PaginatedListingsResponse,
)
from ..city_generator import ensure_listings_for_location

router = APIRouter(prefix="/api/listings", tags=["Listings"])

@router.get(
    "",
    response_model=Union[List[ListingSummaryResponse], PaginatedListingsResponse],
)
def get_listings(
    location: Optional[str] = None,
    category: Optional[str] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    amenities: Optional[str] = None,  # comma-separated IDs
    bedrooms: Optional[int] = None,
    sort_by: Optional[str] = None,    # price_asc, price_desc, rating
    paginated: bool = False,
    page: int = 1,
    page_size: int = 20,
    user_id: Optional[int] = 1,
    db: Session = Depends(get_db)
):
    query = db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.amenities)
    )

    if guests is not None and not 1 <= guests <= 30:
        raise HTTPException(status_code=400, detail="Guests must be between 1 and 30.")
    if bedrooms is not None and not 1 <= bedrooms <= 100:
        raise HTTPException(status_code=400, detail="Bedrooms must be between 1 and 100.")
    if (min_price is not None and min_price < 0) or (max_price is not None and max_price < 0):
        raise HTTPException(status_code=400, detail="Prices cannot be negative.")
    if page < 1 or not 1 <= page_size <= 100:
        raise HTTPException(status_code=400, detail="Page must be positive and page size must be between 1 and 100.")

    # Filter by Location (Any city / country / destination worldwide)
    if location and location.strip():
        loc_clean = location.strip()
        parts = [p.strip() for p in re.split(r"[,/]+", loc_clean) if p.strip()]
        primary_city = parts[0] if parts else loc_clean
        # Strip common trailing keywords like "city", "town", "downtown"
        primary_city_clean = re.sub(
            r"\b(city|town|downtown|center|centre|area|district|province|state|bay)\b",
            "",
            primary_city,
            flags=re.IGNORECASE
        ).strip()
        if not primary_city_clean:
            primary_city_clean = primary_city

        # Primary check: direct city or country match
        city_filters = [
            Listing.city.ilike(f"%{primary_city_clean}%"),
            Listing.country.ilike(f"%{primary_city_clean}%"),
        ]
        if len(parts) > 1:
            country_term = parts[1].strip()
            city_filters.append(Listing.country.ilike(f"%{country_term}%"))

        direct_matches_exist = db.query(Listing.id).filter(or_(*city_filters)).first() is not None

        if direct_matches_exist:
            query = query.filter(or_(*city_filters))
        else:
            # Secondary check: title or address contains the destination name
            title_addr_filters = [
                Listing.title.ilike(f"%{primary_city_clean}%"),
                Listing.address.ilike(f"%{primary_city_clean}%"),
            ]
            title_matches_exist = db.query(Listing.id).filter(or_(*title_addr_filters)).first() is not None
            if title_matches_exist:
                query = query.filter(or_(*title_addr_filters))
            else:
                # If valid query of 3+ letters and not a stop word, check city generator
                if len(primary_city_clean) >= 3 and primary_city_clean.lower() not in ("and", "the", "for", "near", "all"):
                    try:
                        ensure_listings_for_location(db, loc_clean)
                        query = query.filter(Listing.city.ilike(f"%{primary_city_clean}%"))
                    except Exception as e:
                        print(f"Notice: location generator for '{loc_clean}': {e}")
                else:
                    query = query.filter(Listing.id == -1)


    # Filter by Category
    if category and category.lower() != "all":
        query = query.filter(Listing.category.ilike(category.strip()))

    # Filter by Guests Capacity
    if guests and guests > 0:
        query = query.filter(Listing.max_guests >= guests)

    # Filter by Price Range
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=400, detail="Minimum price cannot exceed maximum price.")
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    # Filter by Property Type
    if property_type and property_type.lower() != "any":
        query = query.filter(Listing.property_type.ilike(f"%{property_type.strip()}%"))

    # Filter by Bedrooms
    if bedrooms is not None and bedrooms > 0:
        query = query.filter(Listing.bedrooms >= bedrooms)

    # Filter by Amenities (must have all specified amenities)
    if amenities:
        amenity_tokens = [value.strip() for value in amenities.split(",")]
        if any(not value.isdigit() or int(value) < 1 for value in amenity_tokens):
            raise HTTPException(status_code=422, detail="Amenities must be comma-separated positive IDs.")
        amenity_id_list = [int(value) for value in amenity_tokens]
        for aid in amenity_id_list:
            query = query.filter(Listing.amenities.any(Amenity.id == aid))

    # Filter by Date Availability (if check_in and check_out provided)
    if bool(check_in) != bool(check_out):
        raise HTTPException(
            status_code=400,
            detail="Both check-in and check-out dates are required for availability filtering.",
        )
    if check_in and check_out:
        if check_in >= check_out:
            raise HTTPException(status_code=400, detail="Check-out date must be after check-in date.")
        # Subquery for listing IDs with conflicting bookings
        conflicting_booking_subquery = db.query(Booking.listing_id).filter(
            Booking.status == "confirmed",
            and_(
                Booking.check_in < check_out,
                Booking.check_out > check_in
            )
        ).subquery()
        query = query.filter(Listing.id.not_in(conflicting_booking_subquery))

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Listing.price_per_night.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Listing.price_per_night.desc())
    elif sort_by == "rating":
        query = query.order_by(Listing.rating.desc(), Listing.review_count.desc())
    else:
        query = query.order_by(Listing.id.asc())

    total = query.order_by(None).count() if paginated else 0
    if paginated:
        query = query.offset((page - 1) * page_size).limit(page_size)
    listings = query.all()

    # Get user wishlists to annotate is_wishlisted
    user_wishlist_ids = set()
    if user_id:
        wishlist_records = db.query(Wishlist.listing_id).filter(Wishlist.user_id == user_id).all()
        user_wishlist_ids = {w[0] for w in wishlist_records}

    results = []
    for l in listings:
        res = ListingSummaryResponse.model_validate(l)
        res.is_wishlisted = l.id in user_wishlist_ids
        results.append(res)

    if not paginated:
        return results

    total_pages = ceil(total / page_size) if total else 0
    return PaginatedListingsResponse(
        items=results,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )

@router.get("/{listing_id}", response_model=ListingDetailResponse)
def get_listing(
    listing_id: int,
    user_id: Optional[int] = Query(1, description="Active user ID for wishlist status"),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).options(
        joinedload(Listing.host),
        joinedload(Listing.images),
        joinedload(Listing.amenities),
        joinedload(Listing.reviews).joinedload(Review.user)
    ).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Fetch confirmed booking dates to disable on calendar
    confirmed_bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed"
    ).all()

    booked_ranges = [
        BookedDateRange(
            check_in=b.check_in.isoformat(),
            check_out=b.check_out.isoformat()
        )
        for b in confirmed_bookings
    ]

    is_wishlisted = False
    if user_id:
        w = db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.listing_id == listing_id
        ).first()
        is_wishlisted = w is not None

    res = ListingDetailResponse.model_validate(listing)
    res.booked_dates = booked_ranges
    res.is_wishlisted = is_wishlisted
    return res

@router.post("", response_model=ListingDetailResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: ListingCreate,
    host_id: Optional[int] = Query(2, description="Host user ID"),
    db: Session = Depends(get_db)
):
    host = db.query(User).filter(User.id == host_id).first()
    if not host or host.role != "host":
        raise HTTPException(status_code=404, detail="Host not found")

    new_listing = Listing(
        host_id=host.id,
        title=listing_in.title,
        description=listing_in.description,
        property_type=listing_in.property_type,
        category=listing_in.category,
        address=listing_in.address,
        city=listing_in.city,
        country=listing_in.country,
        latitude=listing_in.latitude,
        longitude=listing_in.longitude,
        price_per_night=listing_in.price_per_night,
        cleaning_fee=listing_in.cleaning_fee,
        service_fee=listing_in.service_fee,
        max_guests=listing_in.max_guests,
        bedrooms=listing_in.bedrooms,
        beds=listing_in.beds,
        bathrooms=listing_in.bathrooms,
        rating=5.0,
        review_count=0,
        is_superhost=host.is_superhost
    )
    db.add(new_listing)
    db.flush()

    # Link amenities
    if listing_in.amenity_ids:
        amenity_ids = set(listing_in.amenity_ids)
        amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
        if len(amenities) != len(amenity_ids):
            db.rollback()
            raise HTTPException(status_code=422, detail="One or more amenity IDs are invalid.")
        new_listing.amenities = amenities

    # Add images
    if listing_in.images:
        for order, img_url in enumerate(listing_in.images):
            img = ListingImage(
                listing_id=new_listing.id,
                image_url=img_url,
                caption=f"Photo {order + 1}",
                display_order=order
            )
            db.add(img)

    db.commit()
    db.refresh(new_listing)

    # Re-fetch with relationships
    return get_listing(listing_id=new_listing.id, user_id=host.id, db=db)

@router.put("/{listing_id}", response_model=ListingDetailResponse)
def update_listing(
    listing_id: int,
    listing_in: ListingUpdate,
    host_id: int = Query(2, description="Active host user ID"),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="You can only edit your own listings.")
    host = db.query(User).filter(User.id == host_id, User.role == "host").first()
    if not host:
        raise HTTPException(status_code=403, detail="Host access is required.")

    update_data = listing_in.model_dump(exclude_unset=True)

    # Handle amenities update
    if "amenity_ids" in update_data:
        amenity_ids = update_data.pop("amenity_ids")
        if amenity_ids is not None:
            unique_amenity_ids = set(amenity_ids)
            amenities = db.query(Amenity).filter(Amenity.id.in_(unique_amenity_ids)).all()
            if len(amenities) != len(unique_amenity_ids):
                raise HTTPException(status_code=422, detail="One or more amenity IDs are invalid.")
            listing.amenities = amenities

    # Handle images update
    if "images" in update_data:
        images_list = update_data.pop("images")
        if images_list is not None:
            db.query(ListingImage).filter(ListingImage.listing_id == listing_id).delete()
            for order, img_url in enumerate(images_list):
                img = ListingImage(
                    listing_id=listing_id,
                    image_url=img_url,
                    caption=f"Photo {order + 1}",
                    display_order=order
                )
                db.add(img)

    for field, value in update_data.items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return get_listing(listing_id=listing.id, user_id=listing.host_id, db=db)

@router.delete("/{listing_id}", status_code=status.HTTP_200_OK)
def delete_listing(
    listing_id: int,
    host_id: int = Query(2, description="Active host user ID"),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings.")
    host = db.query(User).filter(User.id == host_id, User.role == "host").first()
    if not host:
        raise HTTPException(status_code=403, detail="Host access is required.")

    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully", "id": listing_id}
