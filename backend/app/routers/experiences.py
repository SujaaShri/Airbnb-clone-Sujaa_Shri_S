from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc

from ..database import get_db
from ..models import Experience, User
from ..schemas import ExperienceResponse
from ..city_generator import ensure_experiences_for_location

router = APIRouter(prefix="/api/experiences", tags=["Experiences"])

@router.get("", response_model=List[ExperienceResponse])
def get_experiences(
    location: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,  # price_asc, price_desc, rating
    db: Session = Depends(get_db)
):
    clean_search = (search or "").strip().lower()
    clean_location = (location or "").strip().lower()

    # Automatically ensure experiences exist for searched location
    if clean_location and len(clean_location) >= 3:
        try:
            ensure_experiences_for_location(db, clean_location)
        except Exception as e:
            print(f"Notice: experience generator for '{clean_location}': {e}")
    elif clean_search and len(clean_search) >= 3 and clean_search not in ("spa", "food", "cook", "tour", "art", "nature", "safari"):
        has_direct_match = db.query(Experience.id).filter(
            or_(
                Experience.city.ilike(f"%{clean_search}%"),
                Experience.title.ilike(f"%{clean_search}%")
            )
        ).first() is not None
        if not has_direct_match:
            try:
                ensure_experiences_for_location(db, clean_search)
            except Exception as e:
                print(f"Notice: experience generator for '{clean_search}': {e}")

    query = db.query(Experience).options(joinedload(Experience.host))

    # Synonyms dictionary for experiences
    EXP_SYNONYMS = {
        "spa": ["hot spring", "spa", "bath", "wellness", "relaxation"],
        "wellness": ["wellness", "hot spring", "spa", "zen", "tea"],
        "food": ["food", "pasta", "tasting", "tea", "biryani", "culinary", "chef"],
        "cooking": ["pasta", "cooking", "masterclass", "culinary", "chef"],
        "cruise": ["cruise", "yacht", "catamaran", "boat", "sailing"],
        "boat": ["yacht", "catamaran", "cruise", "boat", "kayak"],
        "yacht": ["yacht", "catamaran", "cruise", "boat"],
        "nature": ["volcano", "safari", "trek", "balloon", "kayak", "desert"],
        "safari": ["safari", "desert", "dune", "buggy"],
        "tour": ["tour", "walk", "guide", "expedition"],
        "art": ["street art", "photo", "photography", "portrait", "culture"],
        "photo": ["photography", "portrait", "camera"],
    }


    is_unified = (clean_search and clean_location and clean_search == clean_location)

    if is_unified or (clean_search and not clean_location) or (clean_location and not clean_search):
        term = clean_search or clean_location
        terms = [term]
        for k, syns in EXP_SYNONYMS.items():
            if k in term or any(term in s for s in syns):
                terms.extend(syns)
        terms = list(set(terms))

        conditions = []
        for t in terms:
            pat = f"%{t}%"
            conditions.extend([
                Experience.title.ilike(pat),
                Experience.description.ilike(pat),
                Experience.category.ilike(pat),
                Experience.city.ilike(pat),
                Experience.country.ilike(pat),
                Experience.location.ilike(pat),
            ])
        query = query.filter(or_(*conditions))

    elif clean_search and clean_location:
        # Separate location (e.g. "Dubai") and activity keyword (e.g. "safari")
        search_terms = [clean_search]
        for k, syns in EXP_SYNONYMS.items():
            if k in clean_search or any(clean_search in s for s in syns):
                search_terms.extend(syns)
        search_terms = list(set(search_terms))

        search_conditions = []
        for t in search_terms:
            pat = f"%{t}%"
            search_conditions.extend([
                Experience.title.ilike(pat),
                Experience.description.ilike(pat),
                Experience.category.ilike(pat),
            ])
        query = query.filter(or_(*search_conditions))

        loc_pat = f"%{clean_location}%"
        query = query.filter(
            or_(
                Experience.city.ilike(loc_pat),
                Experience.country.ilike(loc_pat),
                Experience.location.ilike(loc_pat),
            )
        )

    # Category filter
    if category and category.lower() not in ("all", "any"):
        query = query.filter(Experience.category.ilike(f"%{category.strip()}%"))

    # Price filter
    if min_price is not None:
        query = query.filter(Experience.price_per_person >= min_price)
    if max_price is not None:
        query = query.filter(Experience.price_per_person <= max_price)

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Experience.price_per_person.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Experience.price_per_person.desc())
    elif sort_by == "rating":
        query = query.order_by(desc(Experience.rating), desc(Experience.review_count))
    else:
        query = query.order_by(desc(Experience.rating), Experience.id.asc())

    experiences = query.all()

    # Prioritize relevance if search keyword is provided
    if clean_search and not sort_by:
        exp_terms = terms if "terms" in locals() else ([clean_search] if "search_terms" not in locals() else search_terms)
        experiences.sort(
            key=lambda x: (
                0 if clean_search in x.title.lower() else (
                    1 if any(t in x.title.lower() for t in exp_terms) else 2
                ),
                -x.rating,
                -x.review_count,
            )
        )
    elif clean_location and not sort_by:
        experiences.sort(
            key=lambda x: (
                0 if clean_location in x.city.lower() else (
                    1 if clean_location in x.location.lower() else 2
                ),
                -x.rating,
                -x.review_count,
            )
        )

    return experiences

@router.get("/{experience_id}", response_model=ExperienceResponse)
def get_experience(experience_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experience).options(joinedload(Experience.host)).filter(Experience.id == experience_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    return exp
