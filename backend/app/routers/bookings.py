import random
import string
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from ..database import get_db
from ..models import Booking, Listing, User
from ..schemas import (
    BookingCreate,
    BookingPricePreview,
    BookingPriceResponse,
    BookingResponse,
    CheckoutRequest,
    CheckoutResponse,
)

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

def generate_booking_code() -> str:
    letters = "".join(random.choices(string.ascii_uppercase, k=4))
    numbers = "".join(random.choices(string.digits, k=4))
    return f"HM-{letters}{numbers}"


def build_price_quote(
    db: Session,
    listing_id: int,
    check_in: date,
    check_out: date,
    guests_count: int,
) -> BookingPriceResponse:
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if guests_count > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"This listing accommodates a maximum of {listing.max_guests} guests.",
        )

    conflict = db.query(Booking.id).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed",
        and_(
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        ),
    ).first()

    total_nights = (check_out - check_in).days
    nightly_total = round(listing.price_per_night * total_nights, 2)
    cleaning_fee = round(listing.cleaning_fee or 0.0, 2)
    service_fee = round(nightly_total * 0.14, 2)
    available = conflict is None

    return BookingPriceResponse(
        listing_id=listing.id,
        listing_title=listing.title,
        check_in=check_in,
        check_out=check_out,
        guests_count=guests_count,
        total_nights=total_nights,
        nightly_rate=listing.price_per_night,
        nightly_total=nightly_total,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total_price=round(nightly_total + cleaning_fee + service_fee, 2),
        is_available=available,
        message=None if available else "Selected dates are not available.",
    )


@router.post("/price-preview", response_model=BookingPriceResponse)
def preview_booking_price(
    request: BookingPricePreview,
    db: Session = Depends(get_db),
):
    return build_price_quote(
        db,
        request.listing_id,
        request.check_in,
        request.check_out,
        request.guests_count,
    )


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    guest_id: Optional[int] = Query(1, description="Active guest user ID"),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.host)
    ).filter(Listing.id == booking_in.listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    quote = build_price_quote(
        db,
        listing.id,
        booking_in.check_in,
        booking_in.check_out,
        booking_in.guests_count,
    )
    if not quote.is_available:
        raise HTTPException(
            status_code=409,
            detail="Selected dates are not available. Someone has already booked this stay."
        )

    guest = db.query(User).filter(User.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")

    new_booking = Booking(
        booking_code=generate_booking_code(),
        listing_id=listing.id,
        guest_id=guest.id,
        check_in=booking_in.check_in,
        check_out=booking_in.check_out,
        guests_count=booking_in.guests_count,
        nightly_rate=quote.nightly_rate,
        total_nights=quote.total_nights,
        cleaning_fee=quote.cleaning_fee,
        service_fee=quote.service_fee,
        total_price=quote.total_price,
        status="confirmed"
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    first_image = listing.images[0].image_url if listing.images else None

    return BookingResponse(
        id=new_booking.id,
        booking_code=new_booking.booking_code,
        listing_id=new_booking.listing_id,
        guest_id=new_booking.guest_id,
        check_in=new_booking.check_in,
        check_out=new_booking.check_out,
        guests_count=new_booking.guests_count,
        nightly_rate=new_booking.nightly_rate,
        total_nights=new_booking.total_nights,
        cleaning_fee=new_booking.cleaning_fee,
        service_fee=new_booking.service_fee,
        total_price=new_booking.total_price,
        status=new_booking.status,
        created_at=new_booking.created_at,
        listing_title=listing.title,
        listing_city=listing.city,
        listing_country=listing.country,
        listing_image=first_image,
        host_name=listing.host.name if listing.host else None
    )

@router.get("/my", response_model=List[BookingResponse])
def get_user_trips(
    guest_id: Optional[int] = Query(1, description="Active guest user ID"),
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images),
        joinedload(Booking.listing).joinedload(Listing.host)
    ).filter(
        Booking.guest_id == guest_id
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
                host_name=listing.host.name if (listing and listing.host) else None
            )
        )
    return results

@router.delete("/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_booking(
    booking_id: int,
    guest_id: Optional[int] = Query(1, description="Active guest user ID"),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.guest_id == guest_id,
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == "confirmed":
        booking.status = "cancelled"
        db.commit()
    elif booking.status != "cancelled":
        raise HTTPException(status_code=409, detail="This booking can no longer be cancelled.")

    return {"message": "Booking successfully cancelled", "id": booking_id, "status": "cancelled"}


@router.post("/checkout", response_model=CheckoutResponse)
def mock_checkout(
    checkout: CheckoutRequest,
    guest_id: Optional[int] = Query(1, description="Active guest user ID"),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(
        Booking.id == checkout.booking_id,
        Booking.guest_id == guest_id,
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != "confirmed":
        raise HTTPException(status_code=409, detail="Only confirmed bookings can be checked out.")

    return CheckoutResponse(
        success=True,
        booking_code=booking.booking_code,
        message=f"Mock payment with {checkout.payment_method} approved.",
        confirmation_number=f"CONF-{booking.booking_code.removeprefix('HM-')}",
        total_charged=booking.total_price,
    )
