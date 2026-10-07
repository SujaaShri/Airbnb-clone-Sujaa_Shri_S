from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Wishlist, Listing, User
from ..schemas import ListingSummaryResponse, WishlistToggleResponse

router = APIRouter(prefix="/api/wishlists", tags=["Wishlists"])

def require_user(db: Session, user_id: Optional[int]) -> None:
    if user_id is None or not db.query(User.id).filter(User.id == user_id).first():
        raise HTTPException(status_code=404, detail="User not found")


@router.get("", response_model=List[ListingSummaryResponse])
def get_user_wishlist(
    user_id: Optional[int] = Query(1, description="Active user ID"),
    db: Session = Depends(get_db)
):
    require_user(db, user_id)
    wishlists = db.query(Wishlist).options(
        joinedload(Wishlist.listing).joinedload(Listing.images)
    ).filter(Wishlist.user_id == user_id).order_by(Wishlist.created_at.desc()).all()

    results = []
    for w in wishlists:
        if w.listing:
            res = ListingSummaryResponse.model_validate(w.listing)
            res.is_wishlisted = True
            results.append(res)
    return results

@router.get("/ids", response_model=List[int])
def get_user_wishlist_ids(
    user_id: Optional[int] = Query(1, description="Active user ID"),
    db: Session = Depends(get_db)
):
    require_user(db, user_id)
    wishlists = db.query(Wishlist.listing_id).filter(Wishlist.user_id == user_id).all()
    return [w[0] for w in wishlists]

@router.post("/{listing_id}", response_model=WishlistToggleResponse)
def toggle_wishlist(
    listing_id: int,
    user_id: Optional[int] = Query(1, description="Active user ID"),
    db: Session = Depends(get_db)
):
    require_user(db, user_id)
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.listing_id == listing_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return WishlistToggleResponse(
            listing_id=listing_id,
            is_wishlisted=False,
            message="Removed from wishlist"
        )
    else:
        new_w = Wishlist(user_id=user_id, listing_id=listing_id)
        db.add(new_w)
        db.commit()
        return WishlistToggleResponse(
            listing_id=listing_id,
            is_wishlisted=True,
            message="Saved to wishlist"
        )
