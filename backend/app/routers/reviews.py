from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from ..database import get_db
from ..models import Review, Listing, User
from ..schemas import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/api/listings", tags=["Reviews"])

@router.post("/{listing_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    listing_id: int,
    review_in: ReviewCreate,
    user_id: Optional[int] = Query(1, description="Active user ID"),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    user = db.query(User).filter(User.id == user_id, User.role == "guest").first()
    if not user:
        raise HTTPException(status_code=404, detail="Guest user not found")

    new_review = Review(
        listing_id=listing_id,
        user_id=user.id,
        rating=review_in.rating,
        cleanliness=review_in.cleanliness,
        accuracy=review_in.accuracy,
        check_in_rating=review_in.check_in_rating,
        communication=review_in.communication,
        location_rating=review_in.location_rating,
        value_rating=review_in.value_rating,
        comment=review_in.comment
    )

    db.add(new_review)
    db.flush()

    # Recalculate average rating & review count for the listing
    all_reviews = db.query(Review).filter(Review.listing_id == listing_id).all()
    listing.review_count = len(all_reviews)
    if all_reviews:
        avg_score = sum(r.rating for r in all_reviews) / len(all_reviews)
        listing.rating = round(avg_score, 2)

    db.commit()
    db.refresh(new_review)

    # Return with user data loaded
    review_with_user = db.query(Review).options(
        joinedload(Review.user)
    ).filter(Review.id == new_review.id).first()

    return review_with_user

@router.get("/{listing_id}/reviews", response_model=List[ReviewResponse])
def get_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    reviews = db.query(Review).options(
        joinedload(Review.user)
    ).filter(
        Review.listing_id == listing_id
    ).order_by(Review.created_at.desc()).all()

    return reviews
