from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc

from ..database import get_db
from ..models import Listing, Experience, Service, Wishlist
from ..schemas import (
    UnifiedSearchResponse,
    ListingSummaryResponse,
    ExperienceResponse,
    ServiceResponse
)
from .listings import get_listings
from .experiences import get_experiences
from .services import get_services

router = APIRouter(prefix="/api/search", tags=["Unified Search"])

@router.get("", response_model=UnifiedSearchResponse)
def unified_search(
    q: Optional[str] = Query(None, description="General search query or keyword"),
    location: Optional[str] = Query(None, description="Destination city, country, or location"),
    tab: Optional[str] = Query("all", description="'all', 'homes', 'experiences', or 'services'"),
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    guests: Optional[int] = None,
    user_id: Optional[int] = Query(1, description="Active user ID for wishlist status"),
    db: Session = Depends(get_db)
):
    search_query = (q or location or "").strip()
    tab_clean = (tab or "all").lower().strip()

    listings_result = []
    experiences_result = []
    services_result = []

    # 1. Search Listings (Homes)
    if tab_clean in ("all", "homes"):
        loc_param = location or (search_query if search_query else None)
        # Avoid treating pure service queries as city names for listings
        if loc_param and loc_param.lower() in ("massage", "chef", "cooking", "chauffeur", "housekeeping", "wine", "yoga"):
            loc_param = None
            
        listings_result = get_listings(
            location=loc_param,
            category=category if tab_clean == "homes" else None,
            guests=guests,
            min_price=min_price,
            max_price=max_price,
            user_id=user_id,
            db=db
        )

    # 2. Search Experiences
    if tab_clean in ("all", "experiences"):
        experiences_result = get_experiences(
            location=location or search_query,
            category=category if tab_clean == "experiences" else None,
            search=search_query,
            min_price=min_price,
            max_price=max_price,
            db=db
        )

    # 3. Search Services
    if tab_clean in ("all", "services"):
        services_result = get_services(
            location=location or search_query,
            category=category if tab_clean == "services" else None,
            search=search_query,
            min_price=min_price,
            max_price=max_price,
            db=db
        )

    return UnifiedSearchResponse(
        query=search_query,
        location=location,
        listings=listings_result,
        experiences=experiences_result,
        services=services_result,
        total_listings=len(listings_result),
        total_experiences=len(experiences_result),
        total_services=len(services_result),
    )
