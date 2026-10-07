from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Listing
from ..schemas import CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["Categories"])

CATEGORIES_META = [
    {"id": "all", "label": "All", "icon": "Sparkles"},
    {"id": "Amazing pools", "label": "Amazing pools", "icon": "Waves"},
    {"id": "Beachfront", "label": "Beachfront", "icon": "Palmtree"},
    {"id": "Cabins", "label": "Cabins", "icon": "Trees"},
    {"id": "Mansions", "label": "Mansions", "icon": "Castle"},
    {"id": "Luxe", "label": "Luxe", "icon": "Crown"},
    {"id": "Iconic cities", "label": "Iconic cities", "icon": "Building2"},
    {"id": "Lakefront", "label": "Lakefront", "icon": "Sailboat"},
    {"id": "Countryside", "label": "Countryside", "icon": "Tractor"},
    {"id": "Tropical", "label": "Tropical", "icon": "Sun"},
    {"id": "Design", "label": "Design", "icon": "Palette"},
    {"id": "Treehouses", "label": "Treehouses", "icon": "Home"},
]

@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    counts = dict(
        db.query(Listing.category, func.count(Listing.id))
        .group_by(Listing.category)
        .all()
    )
    total_listings = sum(counts.values())

    result = []
    for cat in CATEGORIES_META:
        if cat["id"] == "all":
            cnt = total_listings
        else:
            cnt = counts.get(cat["id"], 0)
        result.append(
            CategoryResponse(
                id=cat["id"],
                label=cat["label"],
                icon=cat["icon"],
                count=cnt
            )
        )
    return result
