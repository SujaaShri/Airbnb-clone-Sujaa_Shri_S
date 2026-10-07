import os
import sys
from datetime import date, datetime, timedelta
import random

# Add parent directory to path so app can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import (
    User,
    Amenity,
    Listing,
    ListingImage,
    Booking,
    Review,
    Wishlist,
    Experience,
    Service,
    listing_amenity_association
)

def seed():
    print("Dropping existing tables and creating fresh schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("Seeding Users...")
    users_data = [
        User(
            id=1,
            name="Alex Rivers",
            email="alex.guest@airbnb-demo.com",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
            is_superhost=False,
            host_bio="Frequent traveler, design enthusiast, and remote software engineer.",
            joined_year=2021,
            role="guest"
        ),
        User(
            id=2,
            name="Sarah Jenkins",
            email="sarah.host@airbnb-demo.com",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
            is_superhost=True,
            host_bio="Architect & hospitality designer. Passionate about creating calm, serene spaces with sustainable materials and breathtaking views.",
            joined_year=2018,
            role="host"
        ),
        User(
            id=3,
            name="Marco Rossi",
            email="marco.host@airbnb-demo.com",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
            is_superhost=True,
            host_bio="Restorer of historic Italian properties. Proud host sharing the beauty of the Amalfi Coast and Lake Como.",
            joined_year=2019,
            role="host"
        ),
        User(
            id=4,
            name="Elena Chen",
            email="elena.guest@airbnb-demo.com",
            avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
            is_superhost=False,
            host_bio="Photographer, foodie, and mountain hiker exploring off-the-beaten-path stays.",
            joined_year=2022,
            role="guest"
        ),
        User(
            id=5,
            name="Hiroshi Tanaka",
            email="hiroshi.host@airbnb-demo.com",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
            is_superhost=True,
            host_bio="Tokyo architect preserving traditional machiya houses and showcasing modern Japanese design.",
            joined_year=2017,
            role="host"
        ),
        User(
            id=6,
            name="Tariq Al-Mansoor",
            email="tariq.host@airbnb-demo.com",
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
            is_superhost=True,
            host_bio="Dubai luxury property concierge and licensed desert expedition leader.",
            joined_year=2018,
            role="host"
        ),
        User(
            id=7,
            name="Priya Sharma",
            email="priya.host@airbnb-demo.com",
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
            is_superhost=True,
            host_bio="Interior stylist host with curated urban apartments in Hyderabad and South India.",
            joined_year=2020,
            role="host"
        ),
        User(
            id=8,
            name="Chef Antoine Blanc",
            email="antoine.chef@airbnb-demo.com",
            avatar_url="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80",
            is_superhost=True,
            host_bio="Michelin-trained French private chef and culinary workshop instructor.",
            joined_year=2019,
            role="host"
        ),
    ]
    for u in users_data:
        db.add(u)
    db.commit()

    print("Seeding Amenities...")
    amenities_data = [
        Amenity(id=1, name="Fast Wifi (350+ Mbps)", icon="Wifi", category="Basics"),
        Amenity(id=2, name="Private infinity pool", icon="Waves", category="Standout"),
        Amenity(id=3, name="Hot tub & jacuzzi", icon="Bath", category="Standout"),
        Amenity(id=4, name="Chef kitchen & island", icon="Utensils", category="Basics"),
        Amenity(id=5, name="Free parking on premises", icon="Car", category="Basics"),
        Amenity(id=6, name="Central Air conditioning", icon="Wind", category="Basics"),
        Amenity(id=7, name="Washer & dryer", icon="Shirt", category="Basics"),
        Amenity(id=8, name="Dedicated workspace", icon="Laptop", category="Basics"),
        Amenity(id=9, name="Indoor fireplace", icon="Flame", category="Standout"),
        Amenity(id=10, name="EV charger", icon="Zap", category="Standout"),
        Amenity(id=11, name="Beachfront access", icon="Palmtree", category="Location"),
        Amenity(id=12, name="Waterfront view", icon="Sailboat", category="Location"),
        Amenity(id=13, name="Mountain panorama", icon="Mountain", category="Location"),
        Amenity(id=14, name="55-inch 4K Smart TV", icon="Tv", category="Basics"),
        Amenity(id=15, name="BBQ outdoor grill", icon="Sun", category="Standout"),
        Amenity(id=16, name="Self check-in (Smart lock)", icon="Key", category="Safety"),
    ]
    for a in amenities_data:
        db.add(a)
    db.commit()

    amenities_dict = {a.id: a for a in amenities_data}

    print("Seeding Listings...")
    raw_listings = [
        # --- HYDERABAD LISTINGS ---
        {
            "id": 1, "host_id": 7,
            "title": "Flat in Madhapur",
            "description": "Well-furnished contemporary 2BHK flat in the heart of Madhapur, Hitec City. Walking distance to metro, cafes, and cyber towers. Fully equipped modular kitchen, 100 Mbps fiber internet, and dedicated parking.",
            "property_type": "Entire flat", "category": "Iconic cities",
            "address": "Plot 42, Ayyappa Society, Madhapur", "city": "Hyderabad", "country": "India",
            "latitude": 17.4483, "longitude": 78.3915, "price_per_night": 1760.0, "cleaning_fee": 300.0, "service_fee": 240.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 2.0, "rating": 5.0, "review_count": 28, "is_superhost": True,
            "amenity_ids": [1, 4, 5, 6, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80",
            ]
        },
        {
            "id": 2, "host_id": 7,
            "title": "Flat in Hyderabad",
            "description": "Chic artist retreat in Jubilee Hills with aesthetic warm lighting, bohemian balcony, plush sofa, smart TV with Netflix, and comfortable king size orthopedic mattress.",
            "property_type": "Entire flat", "category": "Iconic cities",
            "address": "Road No 36, Jubilee Hills", "city": "Hyderabad", "country": "India",
            "latitude": 17.4319, "longitude": 78.4073, "price_per_night": 1900.0, "cleaning_fee": 350.0, "service_fee": 260.0,
            "max_guests": 3, "bedrooms": 1, "beds": 2, "bathrooms": 1.5, "rating": 5.0, "review_count": 42, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 7, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80",
            ]
        },
        {
            "id": 3, "host_id": 2,
            "title": "Home in Hyderabad",
            "description": "Serene spacious 3BHK home in prestigious Banjara Hills. Dark velvet accents, warm wooden textures, high speed wifi, and serene garden balcony. Ideal for families and business travelers.",
            "property_type": "Entire home", "category": "Iconic cities",
            "address": "Banjara Hills Rd 12", "city": "Hyderabad", "country": "India",
            "latitude": 17.4156, "longitude": 78.4357, "price_per_night": 1764.0, "cleaning_fee": 320.0, "service_fee": 245.0,
            "max_guests": 5, "bedrooms": 2, "beds": 3, "bathrooms": 2.0, "rating": 5.0, "review_count": 36, "is_superhost": True,
            "amenity_ids": [1, 4, 5, 6, 7, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
            ]
        },
        {
            "id": 4, "host_id": 7,
            "title": "Room in Hyderabad",
            "description": "Private sunlit room with private attached washroom and breezy balcony in Kondapur. Near Botanical Garden, clean linens, daily housekeeping, and quiet workspace.",
            "property_type": "Private room", "category": "Iconic cities",
            "address": "Kothaguda X Roads, Kondapur", "city": "Hyderabad", "country": "India",
            "latitude": 17.4646, "longitude": 78.3582, "price_per_night": 1349.0, "cleaning_fee": 200.0, "service_fee": 180.0,
            "max_guests": 2, "bedrooms": 1, "beds": 1, "bathrooms": 1.0, "rating": 4.93, "review_count": 51, "is_superhost": False,
            "amenity_ids": [1, 6, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1540518614846-7ede433c4570?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
            ]
        },
        {
            "id": 5, "host_id": 7,
            "title": "Flat in Gachibowli",
            "description": "Cozy bedroom flat with printed designer bedspread, dark curtains, study table, and fast wifi. Located near Financial District and IIIT Hyderabad.",
            "property_type": "Entire flat", "category": "Iconic cities",
            "address": "Telecom Nagar, Gachibowli", "city": "Hyderabad", "country": "India",
            "latitude": 17.4401, "longitude": 78.3489, "price_per_night": 1266.0, "cleaning_fee": 200.0, "service_fee": 175.0,
            "max_guests": 2, "bedrooms": 1, "beds": 1, "bathrooms": 1.0, "rating": 4.75, "review_count": 24, "is_superhost": False,
            "amenity_ids": [1, 6, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1540518614846-7ede433c4570?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
            ]
        },

        # --- COIMBATORE LISTINGS ---
        {
            "id": 6, "host_id": 2,
            "title": "Modernist Home in RS Puram",
            "description": "Peaceful architectural haven in the quiet leafy avenues of RS Puram. Landscaped courtyard, high ceilings, traditional teak accents with contemporary luxuries.",
            "property_type": "Entire home", "category": "Countryside",
            "address": "Diwan Bahadur Rd, RS Puram", "city": "Coimbatore", "country": "India",
            "latitude": 11.0089, "longitude": 76.9535, "price_per_night": 2150.0, "cleaning_fee": 350.0, "service_fee": 290.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 2.0, "rating": 4.96, "review_count": 31, "is_superhost": True,
            "amenity_ids": [1, 4, 5, 6, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80",
            ]
        },
        {
            "id": 7, "host_id": 3,
            "title": "Hillview Cottage in Coimbatore",
            "description": "Nestled near the foothills of the Western Ghats with fresh cool breezes, private garden, stone patio, outdoor swing, and mountain morning mist views.",
            "property_type": "Entire cottage", "category": "Countryside",
            "address": "Marudhamalai Main Rd", "city": "Coimbatore", "country": "India",
            "latitude": 11.0425, "longitude": 76.9022, "price_per_night": 1680.0, "cleaning_fee": 280.0, "service_fee": 220.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 1.5, "rating": 4.88, "review_count": 19, "is_superhost": False,
            "amenity_ids": [1, 4, 5, 8, 13, 15, 16],
            "images": [
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80",
            ]
        },
        {
            "id": 8, "host_id": 2,
            "title": "Garden Villa in Gandhipuram",
            "description": "Central Coimbatore villa with private terrace, manicured lawn, full air conditioning, parking for 2 cars, and quick access to shopping centers.",
            "property_type": "Entire villa", "category": "Iconic cities",
            "address": "Cross Cut Rd, Gandhipuram", "city": "Coimbatore", "country": "India",
            "latitude": 11.0183, "longitude": 76.9654, "price_per_night": 2400.0, "cleaning_fee": 400.0, "service_fee": 320.0,
            "max_guests": 6, "bedrooms": 3, "beds": 3, "bathrooms": 3.0, "rating": 5.0, "review_count": 27, "is_superhost": True,
            "amenity_ids": [1, 4, 5, 6, 7, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80",
            ]
        },

        # --- GOA LISTINGS ---
        {
            "id": 9, "host_id": 2,
            "title": "Villa Calangute Beachfront",
            "description": "Steps away from the Arabian Sea, this private pool luxury villa in North Goa features sun loungers, outdoor bar, and private garden patio.",
            "property_type": "Entire villa", "category": "Beachfront",
            "address": "Holiday Street, Calangute", "city": "Goa", "country": "India",
            "latitude": 15.5394, "longitude": 73.7554, "price_per_night": 3200.0, "cleaning_fee": 500.0, "service_fee": 430.0,
            "max_guests": 6, "bedrooms": 3, "beds": 4, "bathrooms": 3.0, "rating": 4.95, "review_count": 48, "is_superhost": True,
            "amenity_ids": [1, 2, 4, 5, 6, 8, 11, 14, 15, 16],
            "images": [
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80",
            ]
        },
        {
            "id": 10, "host_id": 3,
            "title": "Portuguese Heritage Villa in Anjuna",
            "description": "A 150-year-old restored Portuguese villa with high arched ceilings, private plunge pool, and outdoor dining beneath swaying coconut palms.",
            "property_type": "Entire villa", "category": "Amazing pools",
            "address": "Soranto Vaddo, Anjuna", "city": "Goa", "country": "India",
            "latitude": 15.5808, "longitude": 73.7420, "price_per_night": 4100.0, "cleaning_fee": 600.0, "service_fee": 550.0,
            "max_guests": 8, "bedrooms": 4, "beds": 5, "bathrooms": 4.0, "rating": 4.98, "review_count": 35, "is_superhost": True,
            "amenity_ids": [1, 2, 4, 5, 6, 8, 14, 15, 16],
            "images": [
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1000&q=80",
            ]
        },

        # --- PARIS LISTINGS ---
        {
            "id": 11, "host_id": 2,
            "title": "Haussmannian Balcony Flat overlooking Eiffel Tower",
            "description": "Classic Parisian elegance situated in the prestigious 7th arrondissement. Features herringbone parquet flooring, marble fireplaces, gilded mirrors, and an iconic wrought-iron balcony with direct views of the Eiffel Tower.",
            "property_type": "Entire apartment", "category": "Iconic cities",
            "address": "Avenue de la Bourdonnais, 7th Arr.", "city": "Paris", "country": "France",
            "latitude": 48.8584, "longitude": 2.2945, "price_per_night": 14500.0, "cleaning_fee": 1800.0, "service_fee": 1600.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 2.0, "rating": 4.97, "review_count": 68, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 8, 9, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
            ]
        },
        {
            "id": 12, "host_id": 8,
            "title": "Historic Le Marais Designer Loft with Exposed Beams",
            "description": "An authentic 17th-century artist loft nestled in the vibrant Le Marais. Preserved century-old oak beams, curated contemporary art pieces, spa rainfall shower, and steps away from Place des Vosges.",
            "property_type": "Entire loft", "category": "Design",
            "address": "Rue des Francs-Bourgeois, Le Marais", "city": "Paris", "country": "France",
            "latitude": 48.8575, "longitude": 2.3622, "price_per_night": 11800.0, "cleaning_fee": 1500.0, "service_fee": 1300.0,
            "max_guests": 3, "bedrooms": 1, "beds": 2, "bathrooms": 1.0, "rating": 4.95, "review_count": 52, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1554995207-c18c20360250?auto=format&fit=crop&w=1200&q=80",
            ]
        },

        # --- TOKYO LISTINGS ---
        {
            "id": 13, "host_id": 5,
            "title": "Minimalist Architectural Flat in Omotesando",
            "description": "Designed by a renowned Tokyo architect, this refined minimalist apartment blends concrete, blonde hinoki cedar, and tatami textures. Located in quiet residential Omotesando, minutes from high fashion boutiques.",
            "property_type": "Entire apartment", "category": "Design",
            "address": "Jingumae 4-Chome, Shibuya-ku", "city": "Tokyo", "country": "Japan",
            "latitude": 35.6664, "longitude": 139.7100, "price_per_night": 12400.0, "cleaning_fee": 1600.0, "service_fee": 1400.0,
            "max_guests": 2, "bedrooms": 1, "beds": 1, "bathrooms": 1.0, "rating": 4.99, "review_count": 84, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 7, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
            ]
        },
        {
            "id": 14, "host_id": 5,
            "title": "Panoramic Sky Penthouse overlooking Shibuya Crossing",
            "description": "High-floor luxury residence with floor-to-ceiling panoramic glass windows framing Tokyo's neon skyline. Includes deep Japanese soaking cedar ofuro, Bang & Olufsen sound, and Nespresso bar.",
            "property_type": "Entire apartment", "category": "Iconic cities",
            "address": "Sakuragaokacho, Shibuya-ku", "city": "Tokyo", "country": "Japan",
            "latitude": 35.6580, "longitude": 139.7016, "price_per_night": 18000.0, "cleaning_fee": 2200.0, "service_fee": 1900.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 1.5, "rating": 5.0, "review_count": 91, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 7, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80",
            ]
        },

        # --- DUBAI LISTINGS ---
        {
            "id": 15, "host_id": 6,
            "title": "Palm Jumeirah Beachfront Villa with Private Infinity Pool",
            "description": "Breathtaking beachfront estate on Palm Jumeirah Frond M. Direct private white sand beach access, heated turquoise infinity pool, chef show-kitchen, and panoramic Arabian Gulf sunset vistas.",
            "property_type": "Entire villa", "category": "Beachfront",
            "address": "Frond M, Palm Jumeirah", "city": "Dubai", "country": "United Arab Emirates",
            "latitude": 25.1124, "longitude": 55.1390, "price_per_night": 28000.0, "cleaning_fee": 3500.0, "service_fee": 3000.0,
            "max_guests": 8, "bedrooms": 4, "beds": 5, "bathrooms": 4.5, "rating": 4.99, "review_count": 47, "is_superhost": True,
            "amenity_ids": [1, 2, 3, 4, 5, 6, 8, 11, 12, 14, 15, 16],
            "images": [
                "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
            ]
        },
        {
            "id": 16, "host_id": 6,
            "title": "Burj Khalifa Skyline Luxury Penthouse in Downtown Dubai",
            "description": "Ultra-luxury penthouse facing Burj Khalifa and the Dubai Fountains. Features Italian marble finishes, wraparound glass terrace, 24/7 concierge, private elevator, and Olympic-length infinity pool access.",
            "property_type": "Entire penthouse", "category": "Luxe",
            "address": "Sheikh Mohammed bin Rashid Blvd, Downtown", "city": "Dubai", "country": "United Arab Emirates",
            "latitude": 25.1972, "longitude": 55.2744, "price_per_night": 22500.0, "cleaning_fee": 2800.0, "service_fee": 2400.0,
            "max_guests": 6, "bedrooms": 3, "beds": 3, "bathrooms": 3.5, "rating": 5.0, "review_count": 62, "is_superhost": True,
            "amenity_ids": [1, 2, 3, 4, 5, 6, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80",
            ]
        },

        # --- NEW YORK LISTINGS ---
        {
            "id": 17, "host_id": 2,
            "title": "Sun-Drenched SoHo Cast-Iron Loft",
            "description": "Authentic architectural loft in the historic heart of SoHo. Soaring 14-foot ceilings, original Corinthian columns, huge eastern-facing casement windows, chef Viking range, and custom walnut furniture.",
            "property_type": "Entire loft", "category": "Design",
            "address": "Greene St & Prince St, SoHo", "city": "New York", "country": "United States",
            "latitude": 40.7247, "longitude": -74.0003, "price_per_night": 19500.0, "cleaning_fee": 2400.0, "service_fee": 2100.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 2.0, "rating": 4.98, "review_count": 76, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 7, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
            ]
        },
        {
            "id": 18, "host_id": 2,
            "title": "Brooklyn Heights Historic Brownstone Garden Duplex",
            "description": "Charming 19th-century brownstone apartment with private secluded brick garden patio. Crown moldings, working gas hearth, clawfoot bathtub, and minutes walk to Brooklyn Bridge Promenade.",
            "property_type": "Entire townhouse", "category": "Iconic cities",
            "address": "Pierrepont St, Brooklyn Heights", "city": "New York", "country": "United States",
            "latitude": 40.6960, "longitude": -73.9933, "price_per_night": 15200.0, "cleaning_fee": 1900.0, "service_fee": 1600.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 1.5, "rating": 4.96, "review_count": 59, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 7, 8, 9, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
            ]
        },

        # --- LONDON LISTINGS ---
        {
            "id": 19, "host_id": 2,
            "title": "Kensington Victorian Garden Townhouse",
            "description": "Stunning heritage townhouse overlooking private garden square. High corniced ceilings, bespoke library with velvet armchairs, marble bathrooms, and walkable to Hyde Park.",
            "property_type": "Entire townhouse", "category": "Iconic cities",
            "address": "Queens Gate Gardens, Kensington", "city": "London", "country": "United Kingdom",
            "latitude": 51.4988, "longitude": -0.1802, "price_per_night": 16500.0, "cleaning_fee": 2100.0, "service_fee": 1800.0,
            "max_guests": 5, "bedrooms": 3, "beds": 3, "bathrooms": 2.5, "rating": 4.97, "review_count": 64, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 7, 8, 9, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
            ]
        },

        # --- ROME LISTINGS ---
        {
            "id": 20, "host_id": 3,
            "title": "Trastevere Historic Garden Terrace Penthouse",
            "description": "Perched above the cobblestones of bohemian Trastevere. Beautiful terracotta rooftop terrace overlooking Roman church domes, citrus trees, antique stone archways, and Italian espresso bar.",
            "property_type": "Entire apartment", "category": "Iconic cities",
            "address": "Via della Lungaretta, Trastevere", "city": "Rome", "country": "Italy",
            "latitude": 41.8893, "longitude": 12.4721, "price_per_night": 12800.0, "cleaning_fee": 1600.0, "service_fee": 1400.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 1.5, "rating": 4.98, "review_count": 73, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
            ]
        },

        # --- SANTORINI LISTINGS ---
        {
            "id": 21, "host_id": 2,
            "title": "Villa Oia Caldera Infinity Pool Cave Villa",
            "description": "Perched on the cliff edge of Oia, this cave villa offers unmatched panoramic sunset views over the Aegean caldera with private heated infinity plunge pool and sun deck.",
            "property_type": "Entire villa", "category": "Amazing pools",
            "address": "Nikolaou Nomikou 42, Oia", "city": "Santorini", "country": "Greece",
            "latitude": 36.4618, "longitude": 25.3753, "price_per_night": 24000.0, "cleaning_fee": 2800.0, "service_fee": 2500.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 2.0, "rating": 4.99, "review_count": 58, "is_superhost": True,
            "amenity_ids": [1, 2, 3, 4, 6, 8, 11, 12, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
            ]
        },

        # --- BALI LISTINGS ---
        {
            "id": 22, "host_id": 2,
            "title": "Camaya Bamboo Eco Luxury Treehouse in Ubud",
            "description": "An architectural marvel constructed completely from sustainable petung bamboo, nestled amidst the lush emerald rice terraces of Selat Ubud with outdoor net bed hanging over valley.",
            "property_type": "Entire treehouse", "category": "Treehouses",
            "address": "Banjar Dinas Selat, Ubud", "city": "Bali", "country": "Indonesia",
            "latitude": -8.4550, "longitude": 115.3500, "price_per_night": 9500.0, "cleaning_fee": 1200.0, "service_fee": 1000.0,
            "max_guests": 3, "bedrooms": 1, "beds": 2, "bathrooms": 1.5, "rating": 4.96, "review_count": 67, "is_superhost": True,
            "amenity_ids": [1, 2, 4, 8, 13, 15, 16],
            "images": [
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
            ]
        },

        # --- ASPEN CHALET ---
        {
            "id": 23, "host_id": 2,
            "title": "The Glass Sanctuary - Aspen Mountain Chalet",
            "description": "Floor-to-ceiling glass walls frame dramatic views of Aspen Highlands. Cedar barrel sauna, stone gas hearth, ski-in ski-out access, and outdoor heated jacuzzi.",
            "property_type": "Entire chalet", "category": "Cabins",
            "address": "410 Red Mountain Rd", "city": "Aspen", "country": "United States",
            "latitude": 39.1911, "longitude": -106.8175, "price_per_night": 45000.0, "cleaning_fee": 5000.0, "service_fee": 4200.0,
            "max_guests": 8, "bedrooms": 4, "beds": 5, "bathrooms": 3.5, "rating": 4.99, "review_count": 48, "is_superhost": True,
            "amenity_ids": [1, 3, 4, 5, 6, 7, 8, 9, 10, 13, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
            ]
        },

        # --- LAKE COMO ESTATE ---
        {
            "id": 24, "host_id": 3,
            "title": "Historic Bellagio Waterfront Villa",
            "description": "Direct lakefront neoclassical villa on the quiet shores of Bellagio, Lake Como. Private boat dock, cypress gardens, marble colonnades, and private sunbathing terrace.",
            "property_type": "Entire estate", "category": "Lakefront",
            "address": "Via Garibaldi 12", "city": "Lake Como", "country": "Italy",
            "latitude": 45.9870, "longitude": 9.2625, "price_per_night": 42000.0, "cleaning_fee": 4800.0, "service_fee": 4000.0,
            "max_guests": 10, "bedrooms": 5, "beds": 6, "bathrooms": 4.5, "rating": 4.98, "review_count": 39, "is_superhost": True,
            "amenity_ids": [1, 2, 4, 5, 6, 7, 8, 9, 12, 14, 15, 16],
            "images": [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80",
            ]
        },

        # --- BARCELONA LISTINGS ---
        {
            "id": 25, "host_id": 8,
            "title": "Eixample Modernist Flat with Mosaic Floors",
            "description": "Exquisite modernist apartment in prime Eixample with original Nolla mosaic tiled floors, ornate plaster ceilings, sunny gallery overlooking peaceful courtyard, and Catalan wrought-iron balconies.",
            "property_type": "Entire apartment", "category": "Design",
            "address": "Carrer d'Aragó, Eixample", "city": "Barcelona", "country": "Spain",
            "latitude": 41.3888, "longitude": 2.1645, "price_per_night": 11500.0, "cleaning_fee": 1400.0, "service_fee": 1200.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 1.5, "rating": 4.96, "review_count": 55, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 8, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
            ]
        },

        # --- AMSTERDAM LISTINGS ---
        {
            "id": 26, "host_id": 2,
            "title": "Herengracht 17th-Century Canal House Suite",
            "description": "Authentic Golden Age canal residence directly on Herengracht. Large sash windows framing historic houseboats, French oak floors, antique grandfather clock, and modern luxury bathroom.",
            "property_type": "Entire apartment", "category": "Lakefront",
            "address": "Herengracht 240, Canal Ring", "city": "Amsterdam", "country": "Netherlands",
            "latitude": 52.3712, "longitude": 4.8860, "price_per_night": 14200.0, "cleaning_fee": 1700.0, "service_fee": 1500.0,
            "max_guests": 3, "bedrooms": 1, "beds": 2, "bathrooms": 1.0, "rating": 4.97, "review_count": 61, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 8, 12, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
            ]
        },

        # --- MUMBAI LISTINGS ---
        {
            "id": 27, "host_id": 7,
            "title": "Marine Drive Art-Deco Seafront Apartment",
            "description": "Iconic Queen's Necklace sea-facing residence in heritage Art Deco building on Marine Drive. Watch golden Arabian Sea sunsets right from your living room sofa.",
            "property_type": "Entire apartment", "category": "Iconic cities",
            "address": "Marine Drive, Churchgate", "city": "Mumbai", "country": "India",
            "latitude": 18.9322, "longitude": 72.8264, "price_per_night": 4800.0, "cleaning_fee": 600.0, "service_fee": 520.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 2.0, "rating": 4.95, "review_count": 41, "is_superhost": True,
            "amenity_ids": [1, 4, 6, 8, 12, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
            ]
        },

        # --- BANGKOK LISTINGS ---
        {
            "id": 28, "host_id": 5,
            "title": "Chao Phraya Riverside Penthouse with Private Terrace",
            "description": "Luxe high-rise riverfront residence with dramatic views of Bangkok's illuminated temples and river barges. Features plunge pool on balcony and private ferry boat to ICONSIAM.",
            "property_type": "Entire penthouse", "category": "Amazing pools",
            "address": "Charoen Nakhon Rd, Khlong San", "city": "Bangkok", "country": "Thailand",
            "latitude": 13.7234, "longitude": 100.5090, "price_per_night": 7800.0, "cleaning_fee": 900.0, "service_fee": 820.0,
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 2.0, "rating": 4.97, "review_count": 53, "is_superhost": True,
            "amenity_ids": [1, 2, 4, 6, 8, 12, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
            ]
        },
    ]

    for data in raw_listings:
        listing = Listing(
            id=data["id"],
            host_id=data["host_id"],
            title=data["title"],
            description=data["description"],
            property_type=data["property_type"],
            category=data["category"],
            address=data["address"],
            city=data["city"],
            country=data["country"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            price_per_night=data["price_per_night"],
            cleaning_fee=data["cleaning_fee"],
            service_fee=data["service_fee"],
            max_guests=data["max_guests"],
            bedrooms=data["bedrooms"],
            beds=data["beds"],
            bathrooms=data["bathrooms"],
            rating=data["rating"],
            review_count=data["review_count"],
            is_superhost=data["is_superhost"]
        )
        db.add(listing)
        db.flush()

        for order, img_url in enumerate(data["images"]):
            img = ListingImage(
                listing_id=listing.id,
                image_url=img_url,
                caption=f"View {order + 1}",
                display_order=order
            )
            db.add(img)

        for aid in data["amenity_ids"]:
            if aid in amenities_dict:
                listing.amenities.append(amenities_dict[aid])

    db.commit()

    print("Seeding Experiences...")
    experiences_seed = [
        Experience(
            id=1, host_id=6,
            title="Desert Dune Buggy Safari & Sunset Stargazing",
            description="Experience the raw magic of Dubai's golden desert dunes in high-power dune buggies, followed by authentic Bedouin tea, falconry, and stargazing under the Arabian night sky.",
            category="Nature & Outdoors", badge="Fri · 5:00 PM", is_original=True,
            city="Dubai", country="United Arab Emirates", location="Dubai Desert Dunes, United Arab Emirates",
            latitude=25.0750, longitude=55.5100, price_per_person=4500.0, duration_hours=4.0, group_size=8,
            language="English", rating=4.98, review_count=142,
            image_url="https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=2, host_id=6,
            title="Luxury Yacht Cruise around Dubai Marina & Palm Jumeirah",
            description="Cruise through the crystal turquoise waters of the Arabian Gulf aboard a private 55-foot luxury yacht. Includes fresh tropical mocktails, swimming stop at JBR, and skyline views.",
            category="Sightseeing", badge="Sat · 3:30 PM",
            city="Dubai", country="United Arab Emirates", location="Dubai Marina Yacht Club, United Arab Emirates",
            latitude=25.0810, longitude=55.1380, price_per_person=6200.0, duration_hours=3.0, group_size=12,
            language="English", rating=5.0, review_count=98,
            image_url="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=3, host_id=5,
            title="Traditional Matcha Ceremony & Historic Zen Garden Walk",
            description="Step inside a 200-year-old preserved tea house in Kyoto's historic Gion quarter. Learn the sacred Zen philosophy of Chanoyu tea preparation, whisk stone-ground Uji matcha, and sample handmade seasonal wagashi.",
            category="Food & Drink", badge="Fri · 10:00 AM", is_original=True,
            city="Kyoto", country="Japan", location="Gion Historic District, Kyoto, Japan",
            latitude=35.0037, longitude=135.7770, price_per_person=3200.0, duration_hours=2.0, group_size=6,
            language="English, Japanese", rating=5.0, review_count=98,
            image_url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=4, host_id=5,
            title="Tsukiji Outer Market Food Tasting & Knife Workshop",
            description="Explore the bustling maze of Tsukiji with a local chef. Taste premium otoro tuna, fresh uni, tamagoyaki egg omelet, and meet master artisan Japanese knife makers.",
            category="Food & Drink", badge="Sun · 9:00 AM",
            city="Tokyo", country="Japan", location="Tsukiji Market, Tokyo, Japan",
            latitude=35.6655, longitude=139.7707, price_per_person=4100.0, duration_hours=3.0, group_size=8,
            language="English, Japanese", rating=4.97, review_count=112,
            image_url="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=5, host_id=2,
            title="Sunset Catamaran Cruise & Volcanic Caldera Snorkeling",
            description="Sail past the Red & White beaches of Santorini, swim in warm geothermal sulfur springs, and feast on fresh Greek BBQ with unlimited Assyrtiko white wine as the sun sets into the caldera.",
            category="Nature & Outdoors", badge="Fri · 4:30 PM",
            city="Santorini", country="Greece", location="Amoudi Bay, Oia, Santorini, Greece",
            latitude=36.4622, longitude=25.3725, price_per_person=6800.0, duration_hours=5.0, group_size=14,
            language="English, Greek", rating=4.97, review_count=215,
            image_url="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=6, host_id=3,
            title="Handmade Pasta & Tiramisu Masterclass with Local Chef",
            description="Learn how to knead silky egg pasta dough, roll tagliatelle, fold filled ravioli, and craft authentic Italian mascarpone tiramisu paired with Chianti Classico wine in a Tuscan villa.",
            category="Food & Drink", badge="Sat · 11:30 AM", is_original=True,
            city="Florence", country="Italy", location="San Frediano, Florence, Italy",
            latitude=43.7690, longitude=11.2435, price_per_person=4100.0, duration_hours=3.5, group_size=8,
            language="English, Italian", rating=4.99, review_count=320,
            image_url="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=7, host_id=2,
            title="Hot Air Balloon Sunrise Flight over Fairy Chimneys",
            description="Float peacefully at sunrise above Cappadocia's dramatic volcanic valleys, rose-tinted fairy chimneys, and cave dwellings. Celebrate landing with champagne and personalized flight certificates.",
            category="Nature & Outdoors", badge="Sat · 5:30 AM",
            city="Cappadocia", country="Turkey", location="Göreme National Park, Cappadocia, Turkey",
            latitude=38.6431, longitude=34.8289, price_per_person=12500.0, duration_hours=3.0, group_size=16,
            language="English", rating=5.0, review_count=185,
            image_url="https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=8, host_id=8,
            title="Private Golden Hour Portrait Photography at the Eiffel Tower",
            description="Stroll through secret Parisian vantage points at Trocadéro, Bir-Hakeim, and the Seine riverbanks. Receive 40 high-resolution edited photos captured by a published editorial photographer.",
            category="Arts & Culture", badge="Sat · 6:00 PM",
            city="Paris", country="France", location="Trocadéro & Eiffel Tower, Paris, France",
            latitude=48.8623, longitude=2.2882, price_per_person=5400.0, duration_hours=2.0, group_size=4,
            language="English, French", rating=4.98, review_count=114,
            image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=9, host_id=2,
            title="Backwater Kayaking & Mangrove Birdwatching Expedition",
            description="Paddle through the quiet serpentine backwaters of the Sal River in South Goa. Spot kingfishers, brahminy kites, and mudskippers in pristine coastal mangroves with a naturalist guide.",
            category="Nature & Outdoors", badge="Sun · 7:00 AM",
            city="Goa", country="India", location="Sal Backwaters, Mobor, South Goa, India",
            latitude=15.1500, longitude=73.9500, price_per_person=2200.0, duration_hours=3.0, group_size=8,
            language="English, Hindi", rating=4.94, review_count=78,
            image_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=10, host_id=7,
            title="Old City Biryani & Heritage Street Food Night Walk",
            description="Discover the royal culinary secrets of the Nizams. Taste authentic firewood Dum Biryani, melt-in-mouth Pathar ka Gosht, Osmania biscuits with Irani chai around historic Charminar.",
            category="Food & Drink", badge="Sat · 6:30 PM",
            city="Hyderabad", country="India", location="Charminar Old City, Hyderabad, India",
            latitude=17.3616, longitude=78.4747, price_per_person=1400.0, duration_hours=3.0, group_size=10,
            language="English, Hindi, Telugu", rating=4.99, review_count=165,
            image_url="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=11, host_id=2,
            title="Mount Batur Sunrise Volcano Trekking & Natural Hot Springs",
            description="Hike up active Mount Batur under the stars. Watch golden sunrise over Bali's crater lake while enjoying eggs cooked over volcanic steam, followed by relaxing dip in thermal hot springs.",
            category="Nature & Outdoors", badge="Daily · 3:00 AM",
            city="Bali", country="Indonesia", location="Kintamani, Mount Batur, Bali, Indonesia",
            latitude=-8.2421, longitude=115.3753, price_per_person=3500.0, duration_hours=6.0, group_size=10,
            language="English", rating=4.95, review_count=138,
            image_url="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=12, host_id=2,
            title="SoHo & Brooklyn Street Art & Underground Food Tour",
            description="Uncover secret street murals in Bushwick and taste artisan wood-fired New York pizza, bagels, and handmade chocolate in Brooklyn's coolest artistic pockets.",
            category="Arts & Culture", badge="Sat · 1:00 PM",
            city="New York", country="United States", location="Williamsburg & Bushwick, New York, United States",
            latitude=40.7081, longitude=-73.9571, price_per_person=5800.0, duration_hours=3.5, group_size=10,
            language="English", rating=4.97, review_count=92,
            image_url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=13, host_id=7,
            title="Mylapore Heritage & Kapaleeshwarar Temple Spiritual Walk",
            description="Stroll through the vibrant 7th-century Dravidian temple district of Mylapore. Admire the soaring Kapaleeshwarar gopuram, witness sacred morning rituals, hear stories of ancient Chola architecture, and sample authentic South Indian filter coffee in bronze davarahs.",
            category="Arts & Culture", badge="Daily · 6:30 AM",
            city="Chennai", country="India", location="Mylapore Heritage Quarter, Chennai, India",
            latitude=13.0336, longitude=80.2699, price_per_person=1200.0, duration_hours=2.5, group_size=8,
            language="English, Tamil", rating=4.98, review_count=112,
            image_url="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=14, host_id=7,
            title="Marina Beach Sunset Promenade & Coastal Street Food Trail",
            description="Feel the ocean breeze along the world's second-longest urban beach. Taste crisp piping-hot sundal, chilli bajjis, fresh roasted corn with lime masala, and pan-seared coastal catch prepared by legendary seaside cooks.",
            category="Food & Drink", badge="Fri · 5:00 PM",
            city="Chennai", country="India", location="Marina Promenade, Chennai, India",
            latitude=13.0500, longitude=80.2824, price_per_person=1500.0, duration_hours=3.0, group_size=10,
            language="English, Hindi, Tamil", rating=4.96, review_count=94,
            image_url="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=15, host_id=8,
            title="Classical Carnatic Music & Bharatanatyam Heritage Workshop",
            description="Discover the heart of South Indian classical arts. Meet renowned musicians, explore ancient talas and ragas on the veena and mridangam, and witness an expressive live Bharatanatyam mudra demonstration in an open-air pavilion.",
            category="Arts & Culture", badge="Sat · 4:00 PM",
            city="Chennai", country="India", location="Kalakshetra & Besant Nagar, Chennai, India",
            latitude=13.0012, longitude=80.2655, price_per_person=2200.0, duration_hours=2.5, group_size=6,
            language="English, Tamil", rating=4.99, review_count=78,
            image_url="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=16, host_id=7,
            title="Traditional South Indian Filter Coffee & Tiffin Masterclass",
            description="Master the art of brewing aromatic chicory-infused filter kaapi with traditional brass filters. Learn to froth milk from arm's length heights, and prepare cloud-soft idlis, crisp medu vadas, and fiery coconut chutneys.",
            category="Food & Drink", badge="Sun · 8:30 AM",
            city="Chennai", country="India", location="T. Nagar & Alwarpet, Chennai, India",
            latitude=13.0418, longitude=80.2341, price_per_person=950.0, duration_hours=2.0, group_size=8,
            language="English, Hindi, Tamil", rating=4.97, review_count=135,
            image_url="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
        ),
        Experience(
            id=17, host_id=2,
            title="Mahabalipuram UNESCO Shore Temple & Stone Carving Expedition",
            description="Journey down the scenic coastal East Coast Road to UNESCO world heritage monolithic rock shrines. Explore Arjuna's Penance, the dramatic oceanfront Shore Temple, and try your hand at granite chiseling with master sculptors.",
            category="Nature & Outdoors", badge="Daily · 7:00 AM",
            city="Chennai", country="India", location="East Coast Road & Mahabalipuram, Chennai, India",
            latitude=12.6269, longitude=80.1927, price_per_person=3200.0, duration_hours=5.0, group_size=10,
            language="English, French, Tamil", rating=5.0, review_count=160,
            image_url="https://images.unsplash.com/photo-1600100397608-f010f443315a?auto=format&fit=crop&w=800&q=80"
        ),
    ]

    for exp in experiences_seed:
        db.add(exp)
    db.commit()

    print("Seeding Services...")
    services_seed = [
        Service(
            id=1, provider_id=8,
            title="Private Executive Chef & 5-Course Gourmet Dinner",
            description="Michelin-experienced private chef arrives at your villa with fresh market ingredients, prepares customized multi-course culinary dinner, serves courses, and leaves your kitchen spotless.",
            category="Dining & Chefs", service_type="In-Residence Dining",
            city="Worldwide", country="Global", location="In-Villa Private Dining",
            price=3500.0, unit="hour", rating=5.0, review_count=64,
            image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
        ),
        Service(
            id=2, provider_id=4,
            title="Editorial Travel & Lifestyle Photography Session",
            description="Professional photographer captures natural, magazine-worthy portraits of you, your partner, or family against landmark cityscapes or luxury villa backdrops.",
            category="Photography", service_type="On-Location",
            city="Worldwide", country="Global", location="City Landmarks & Stays",
            price=4200.0, unit="session", rating=4.98, review_count=92,
            image_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
        ),
        Service(
            id=3, provider_id=6,
            title="Luxury Mercedes Chauffeur & Airport Concierge",
            description="Pristine Mercedes-Benz S-Class or V-Class with professional suited chauffeur. Flight tracking, luggage assistance, chilled Fiji water, and seamless door-to-door transit.",
            category="Transport", service_type="Private Chauffeur",
            city="Worldwide", country="Global", location="Door-to-door Transfers",
            price=2800.0, unit="trip", rating=4.99, review_count=130,
            image_url="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
        ),
        Service(
            id=4, provider_id=1,
            title="In-Residence Deep Tissue & Aromatherapy Massage",
            description="Certified spa therapist sets up heated memory-foam massage table, organic cold-pressed essential oils, and soothing ambient soundscapes directly in your villa or suite.",
            category="Wellness & Spa", service_type="Mobile Spa",
            city="Worldwide", country="Global", location="Your Villa or Suite",
            price=3200.0, unit="session", rating=4.97, review_count=75,
            image_url="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
        ),
        Service(
            id=5, provider_id=3,
            title="Certified Sommelier & Curated Wine Pairing Experience",
            description="Private sommelier brings rare vintage bottles, crystal glassware, and artisan cheese pairings to your vacation home for an intimate guided wine tasting salon.",
            category="Beverage & Sommelier", service_type="Private Tasting",
            city="Worldwide", country="Global", location="Private Residence",
            price=4800.0, unit="tasting", rating=5.0, review_count=41,
            image_url="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80"
        ),
        Service(
            id=6, provider_id=7,
            title="5-Star Hotel Housekeeping & Mid-Stay Linen Turnover",
            description="Complete property refreshing: crisp 600-thread Egyptian cotton linen turnover, plush fresh towels, bathroom sanitization, floor polishing, and kitchen cleaning.",
            category="Housekeeping", service_type="Cleaning & Linens",
            city="Worldwide", country="Global", location="Full Property Cleaning",
            price=2100.0, unit="service", rating=4.95, review_count=110,
            image_url="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
        ),
        Service(
            id=7, provider_id=2,
            title="Personal Luggage Storage & VIP Port Concierge",
            description="Secure early arrival or late departure baggage handling with GPS tracked transfers from train station or airport direct to your listing check-in.",
            category="Transport", service_type="Luggage & Concierge",
            city="Worldwide", country="Global", location="Citywide Service",
            price=1200.0, unit="service", rating=4.92, review_count=88,
            image_url="https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=800&q=80"
        ),
        Service(
            id=8, provider_id=1,
            title="Private Yoga & Guided Sound Bath Meditation",
            description="Private sunrise or sunset yoga session on your terrace with Tibetan singing bowls, pranayama breathwork, and personalized alignment guidance.",
            category="Wellness & Spa", service_type="In-Residence Wellness",
            city="Worldwide", country="Global", location="Villa Terrace or Garden",
            price=2600.0, unit="session", rating=4.99, review_count=57,
            image_url="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
        ),
        Service(
            id=9, provider_id=4,
            title="Luxury In-Villa Thermal Spa & Anti-Aging Facial Rejuvenation",
            description="Deluxe holistic spa day brought to your villa: organic seaweed body scrub, aromatherapy hot stone massage, collagen boost facial, and herbal detox tea ceremony.",
            category="Wellness & Spa", service_type="Thermal Spa & Facials",
            city="Worldwide", country="Global", location="In-Villa Luxury Spa",
            price=4500.0, unit="package", rating=5.0, review_count=48,
            image_url="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
        ),
        Service(
            id=10, provider_id=3,
            title="Bespoke Craft Mixologist & Sunset Cocktail Bar",
            description="Award-winning craft mixologist sets up a mobile bar with artisanal spirits, hand-pressed citrus, signature cocktail menu, and premium crystal glassware for your sunset party.",
            category="Beverage & Sommelier", service_type="Private Mixologist",
            city="Worldwide", country="Global", location="Villa Terrace or Poolside",
            price=3800.0, unit="evening", rating=4.97, review_count=65,
            image_url="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80"
        ),
    ]

    for srv in services_seed:
        db.add(srv)
    db.commit()

    print("Seeding Reviews...")
    reviews_seed = [
        (1, 4, 5.0, "Super clean and extremely convenient location in Madhapur! The wifi was lightning fast and the kitchen had everything needed. 5/5 stars."),
        (1, 1, 5.0, "Smooth self check-in, peaceful apartment, and very close to Hitec City offices. Highly recommended!"),
        (2, 4, 5.0, "Jubilee Hills is the best neighborhood in Hyderabad and this flat was beautifully decorated. Loved the cozy lights and balcony."),
        (3, 1, 5.0, "Spacious home, immaculate cleanliness, and great communication with host. Great stay for our family."),
        (6, 4, 5.0, "RS Puram is lovely and this home exceeded our expectations. Clean, modern, and very comfortable beds."),
        (9, 1, 5.0, "Walking straight from the villa onto the beach in Goa was paradise. Private pool was cleaned daily!"),
        (11, 4, 5.0, "Waking up to the Eiffel Tower from the balcony in Paris was a dream come true!"),
        (13, 1, 5.0, "The cedar ofuro bath and Omotesando location made this our best trip to Tokyo ever."),
        (15, 4, 5.0, "Palm Jumeirah villa was truly royal. Direct beach access and crystal clear pool!"),
    ]

    for lid, uid, score, comment in reviews_seed:
        r = Review(
            listing_id=lid,
            user_id=uid,
            rating=score,
            cleanliness=5.0,
            accuracy=5.0,
            check_in_rating=5.0,
            communication=5.0,
            location_rating=5.0,
            value_rating=4.9,
            comment=comment,
            created_at=datetime.now() - timedelta(days=random.randint(5, 90))
        )
        db.add(r)
    db.commit()

    print("Seeding Bookings (Active and Past)...")
    today = date.today()
    bookings_seed = [
        Booking(
            booking_code="HM-HYD8892",
            listing_id=1,
            guest_id=1,
            check_in=today + timedelta(days=14),
            check_out=today + timedelta(days=17),
            guests_count=2,
            nightly_rate=1760.0,
            total_nights=3,
            cleaning_fee=300.0,
            service_fee=240.0,
            total_price=5820.0,
            status="confirmed"
        ),
        Booking(
            booking_code="HM-CBE4419",
            listing_id=6,
            guest_id=1,
            check_in=today + timedelta(days=30),
            check_out=today + timedelta(days=34),
            guests_count=4,
            nightly_rate=2150.0,
            total_nights=4,
            cleaning_fee=350.0,
            service_fee=290.0,
            total_price=9240.0,
            status="confirmed"
        ),
    ]
    for b in bookings_seed:
        db.add(b)
    db.commit()

    print("Seeding Wishlists...")
    wishlists_seed = [
        Wishlist(user_id=1, listing_id=1),
        Wishlist(user_id=1, listing_id=3),
        Wishlist(user_id=1, listing_id=9),
        Wishlist(user_id=1, listing_id=11),
        Wishlist(user_id=1, listing_id=13),
    ]
    for w in wishlists_seed:
        db.add(w)
    db.commit()

    print("Database seeding completed successfully with 28 listings, 12 experiences, 8 services, users, bookings, and reviews!")
    db.close()

if __name__ == "__main__":
    seed()
