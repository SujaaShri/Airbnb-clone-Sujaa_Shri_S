from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from ..database import get_db
from ..models import Listing, Booking, User, Review
from ..schemas import HostStatsResponse, HostListingItem, BookingResponse

router = APIRouter(prefix="/api/host", tags=["Host Dashboard"])

@router.get("/stats", response_model=HostStatsResponse)
def get_host_stats(
    host_id: Optional[int] = Query(2, description="Host user ID"),
    db: Session = Depends(get_db)
):
    # Total listings owned by host
    host_listings = db.query(Listing).filter(Listing.host_id == host_id).all()
    listing_ids = [l.id for l in host_listings]

    if not listing_ids:
        return HostStatsResponse(
            total_listings=0,
            total_bookings=0,
            total_revenue=0.0,
            average_rating=5.0
        )

    # Bookings on host's listings
    bookings = db.query(Booking).filter(
        Booking.listing_id.in_(listing_ids),
        Booking.status == "confirmed"
    ).all()

    total_revenue = sum(b.total_price for b in bookings)
    total_bookings = len(bookings)

    # Avg rating of host listings
    avg_rating = db.query(func.avg(Listing.rating)).filter(Listing.host_id == host_id).scalar() or 5.0

    return HostStatsResponse(
        total_listings=len(host_listings),
        total_bookings=total_bookings,
        total_revenue=round(total_revenue, 2),
        average_rating=round(float(avg_rating), 2)
    )

@router.get("/listings", response_model=List[HostListingItem])
def get_host_listings(
    host_id: Optional[int] = Query(2, description="Host user ID"),
    db: Session = Depends(get_db)
):
    listings = db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.bookings)
    ).filter(Listing.host_id == host_id).order_by(Listing.created_at.desc()).all()

    items = []
    for l in listings:
        confirmed_bookings = [b for b in l.bookings if b.status == "confirmed"]
        revenue = sum(b.total_price for b in confirmed_bookings)
        img = l.images[0].image_url if l.images else None

        items.append(
            HostListingItem(
                id=l.id,
                title=l.title,
                city=l.city,
                country=l.country,
                price_per_night=l.price_per_night,
                rating=l.rating,
                review_count=l.review_count,
                category=l.category,
                image_url=img,
                bookings_count=len(confirmed_bookings),
                total_revenue=round(revenue, 2),
                created_at=l.created_at
            )
        )
    return items

@router.get("/reservations", response_model=List[BookingResponse])
def get_host_reservations(
    host_id: Optional[int] = Query(2, description="Host user ID"),
    db: Session = Depends(get_db)
):
    host_listing_ids = db.query(Listing.id).filter(Listing.host_id == host_id).all()
    ids = [l[0] for l in host_listing_ids]

    if not ids:
        return []

    bookings = db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images),
        joinedload(Booking.guest)
    ).filter(
        Booking.listing_id.in_(ids)
    ).order_by(Booking.check_in.desc()).all()

    results = []
    for b in bookings:
        listing = b.listing
        img = listing.images[0].image_url if (listing and listing.images) else None
        results.append(
            BookingResponse(
                id=b.id,
                booking_code=b.booking_code,
                listing_id=b.listing_id,
                guest_id=b.guest_id,
                check_in=b.check_in,
                check_out=b.check_out,
                guests_count=b.guests_count,
                nightly_rate=b.nightly_rate,
                total_nights=b.total_nights,
                cleaning_fee=b.cleaning_fee,
                service_fee=b.service_fee,
                total_price=b.total_price,
                status=b.status,
                created_at=b.created_at,
                listing_title=listing.title if listing else "Listing",
                listing_city=listing.city if listing else "",
                listing_country=listing.country if listing else "",
                listing_image=img,
                host_name=b.guest.name if b.guest else None
            )
        )
    return results
