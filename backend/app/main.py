import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from sqlalchemy import inspect, text
from .database import engine, Base
from .models import *  # ensure all models registered
from .routers import (
    listings,
    bookings,
    host,
    reviews,
    wishlists,
    users,
    categories,
    amenities,
    experiences,
    services,
    search
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name == "sqlite" and inspect(engine).has_table("experiences"):
        columns = {column["name"] for column in inspect(engine).get_columns("experiences")}
        with engine.begin() as connection:
            if "is_original" not in columns:
                connection.execute(
                    text("ALTER TABLE experiences ADD COLUMN is_original BOOLEAN NOT NULL DEFAULT 0")
                )
            connection.execute(
                text(
                    "UPDATE experiences SET is_original = 1 "
                    "WHERE title IN (:desert_title, :matcha_title, :pasta_title)"
                ),
                {
                    "desert_title": "Desert Dune Buggy Safari & Sunset Stargazing",
                    "matcha_title": "Traditional Matcha Ceremony & Historic Zen Garden Walk",
                    "pasta_title": "Handmade Pasta & Tiramisu Masterclass with Local Chef",
                },
            )
    yield

app = FastAPI(
    title="Airbnb Clone API",
    description="Fullstack Airbnb Clone API with listings, bookings, search, filters, host CRUD, reviews, experiences, services and wishlists.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(host.router)
app.include_router(reviews.router)
app.include_router(wishlists.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(amenities.router)
app.include_router(experiences.router)
app.include_router(services.router)
app.include_router(search.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Airbnb Clone API", "version": "1.0.0"}

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Airbnb Clone Backend API is running.",
        "docs": "/docs",
        "health": "/api/health"
    }
