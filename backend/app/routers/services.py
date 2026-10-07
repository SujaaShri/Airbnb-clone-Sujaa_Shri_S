from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc

from ..database import get_db
from ..models import Service, User
from ..schemas import ServiceResponse
from ..city_generator import ensure_services_for_location

router = APIRouter(prefix="/api/services", tags=["Services"])

@router.get("", response_model=List[ServiceResponse])
def get_services(
    location: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,  # price_asc, price_desc, rating
    db: Session = Depends(get_db)
):
    # Pre-generate / ensure services for major Indian cities if searched
    clean_search = (search or "").strip().lower()
    clean_location = (location or "").strip().lower()

    loc_to_check = clean_location or clean_search
    if loc_to_check:
        ensure_services_for_location(db, loc_to_check)

    query = db.query(Service).options(joinedload(Service.provider))

    # Synonyms dictionary to broaden hospitality search queries
    SYNONYMS = {
        "spa": ["spa", "facial", "relaxation", "hot stone", "thermal", "wellness"],
        "massage": ["massage", "aromatherapy", "deep tissue", "reflexology"],
        "wellness": ["wellness", "yoga", "meditation", "sound bath"],
        "yoga": ["yoga", "meditation", "sound bath", "pranayama"],
        "chef": ["chef", "cook", "dining", "culinary", "gourmet", "michelin"],
        "food": ["chef", "dining", "culinary", "gourmet", "dinner"],
        "cook": ["chef", "dining", "culinary", "cooking"],
        "dining": ["chef", "dining", "culinary", "dinner"],
        "driver": ["chauffeur", "mercedes", "transport", "transit"],
        "chauffeur": ["chauffeur", "mercedes", "transport", "transit"],
        "transport": ["chauffeur", "mercedes", "transport", "transit", "luggage"],
        "car": ["chauffeur", "mercedes", "transport"],
        "airport": ["chauffeur", "mercedes", "transport", "airport", "concierge", "luggage"],
        "photo": ["photography", "photographer", "portrait", "editorial", "lifestyle"],
        "photography": ["photography", "photographer", "portrait", "editorial", "lifestyle"],
        "wine": ["sommelier", "wine", "tasting", "vintage", "pairing"],
        "sommelier": ["sommelier", "wine", "tasting", "vintage", "pairing"],
        "cocktail": ["mixologist", "cocktail", "bar", "drinks", "bartender"],
        "clean": ["housekeeping", "cleaning", "linen turnover", "maid"],
        "cleaning": ["housekeeping", "cleaning", "linen turnover", "maid"],
        "housekeeping": ["housekeeping", "cleaning", "linen turnover", "maid"],
        "luggage": ["luggage", "storage", "baggage", "concierge", "port"],
    }

    # Determine if location and search are identical (common frontend search bar pattern)
    is_unified = (clean_search and clean_location and clean_search == clean_location)

    if is_unified or (clean_search and not clean_location) or (clean_location and not clean_search):
        # Single query term
        term = clean_search or clean_location
        terms_to_match = [term]
        for key, syns in SYNONYMS.items():
            if key in term or any(term in s for s in syns):
                terms_to_match.extend(syns)
        terms_to_match = list(set(terms_to_match))

        conditions = []
        for t in terms_to_match:
            t_pattern = f"%{t}%"
            conditions.extend([
                Service.title.ilike(t_pattern),
                Service.description.ilike(t_pattern),
                Service.category.ilike(t_pattern),
                Service.service_type.ilike(t_pattern),
                Service.location.ilike(t_pattern),
                Service.city.ilike(t_pattern),
                Service.country.ilike(t_pattern),
            ])
        query = query.filter(or_(*conditions))

    elif clean_search and clean_location:
        # Separate location (e.g. city) and service search term (e.g. "chef")
        # 1. Match search term
        search_terms = [clean_search]
        for key, syns in SYNONYMS.items():
            if key in clean_search or any(clean_search in s for s in syns):
                search_terms.extend(syns)
        search_terms = list(set(search_terms))

        search_conditions = []
        for t in search_terms:
            t_pattern = f"%{t}%"
            search_conditions.extend([
                Service.title.ilike(t_pattern),
                Service.description.ilike(t_pattern),
                Service.category.ilike(t_pattern),
                Service.service_type.ilike(t_pattern),
            ])
        query = query.filter(or_(*search_conditions))

        # 2. Match location: must match city/country/location specifically
        loc_pattern = f"%{clean_location}%"
        if clean_location in ("worldwide", "global", "anywhere"):
            query = query.filter(
                or_(
                    Service.city.ilike(loc_pattern),
                    Service.country.ilike(loc_pattern),
                    Service.location.ilike(loc_pattern),
                    Service.city.ilike("%worldwide%"),
                    Service.country.ilike("%global%"),
                )
            )
        else:
            query = query.filter(
                or_(
                    Service.city.ilike(loc_pattern),
                    Service.country.ilike(loc_pattern),
                    Service.location.ilike(loc_pattern),
                )
            )

    # Category filter
    if category and category.lower() not in ("all", "any"):
        query = query.filter(Service.category.ilike(f"%{category.strip()}%"))

    # Price filter
    if min_price is not None:
        query = query.filter(Service.price >= min_price)
    if max_price is not None:
        query = query.filter(Service.price <= max_price)

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Service.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Service.price.desc())
    elif sort_by == "rating":
        query = query.order_by(desc(Service.rating), desc(Service.review_count))
    else:
        query = query.order_by(desc(Service.rating), Service.id.asc())

    services = query.all()

    # Prioritize relevance if search keyword is provided
    if clean_search and not sort_by:
        all_match_terms = terms_to_match if "terms_to_match" in locals() else ([clean_search] if "search_terms" not in locals() else search_terms)
        services.sort(
            key=lambda x: (
                0 if clean_search in x.title.lower() else (
                    1 if any(t in x.title.lower() for t in all_match_terms) else 2
                ),
                -x.rating,
                -x.review_count,
            )
        )

    return services

@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    srv = db.query(Service).options(joinedload(Service.provider)).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")
    return srv
