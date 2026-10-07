from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Amenity
from ..schemas import AmenityResponse

router = APIRouter(prefix="/api/amenities", tags=["Amenities"])

@router.get("", response_model=List[AmenityResponse])
def get_amenities(db: Session = Depends(get_db)):
    return db.query(Amenity).all()
