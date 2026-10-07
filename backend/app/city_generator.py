import re
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from .models import Listing, ListingImage, Amenity, Review, User, Experience, Service

# Pre-defined geographic coordinates and details for 60+ top world travel destinations
WORLD_CITIES = {
    "paris": {
        "city": "Paris", "country": "France", "lat": 48.8566, "lng": 2.3522,
        "neighborhoods": ["Le Marais", "Montmartre", "Saint-Germain-des-Prés", "Latin Quarter", "Champs-Élysées", "Bastille"],
        "price_base": 180,
    },
    "tokyo": {
        "city": "Tokyo", "country": "Japan", "lat": 35.6762, "lng": 139.6503,
        "neighborhoods": ["Shinjuku", "Shibuya", "Ginza", "Roppongi", "Asakusa", "Meguro", "Omotesando"],
        "price_base": 140,
    },
    "london": {
        "city": "London", "country": "United Kingdom", "lat": 51.5074, "lng": -0.1278,
        "neighborhoods": ["Kensington", "Notting Hill", "Covent Garden", "Mayfair", "Soho", "Chelsea", "Shoreditch"],
        "price_base": 190,
    },
    "new york": {
        "city": "New York", "country": "United States", "lat": 40.7128, "lng": -74.0060,
        "neighborhoods": ["Manhattan", "SoHo", "Brooklyn Heights", "Greenwich Village", "Tribeca", "Williamsburg", "Chelsea"],
        "price_base": 240,
    },
    "dubai": {
        "city": "Dubai", "country": "United Arab Emirates", "lat": 25.2048, "lng": 55.2708,
        "neighborhoods": ["Downtown Dubai", "Palm Jumeirah", "Dubai Marina", "Business Bay", "JBR Beach", "DIFC"],
        "price_base": 220,
    },
    "rome": {
        "city": "Rome", "country": "Italy", "lat": 41.9028, "lng": 12.4964,
        "neighborhoods": ["Trastevere", "Campo de' Fiori", "Piazza Navona", "Monti", "Prati", "Colosseum Quarter"],
        "price_base": 160,
    },
    "barcelona": {
        "city": "Barcelona", "country": "Spain", "lat": 41.3851, "lng": 2.1734,
        "neighborhoods": ["Eixample", "Gothic Quarter", "Gràcia", "El Born", "Poblenou", "Barceloneta"],
        "price_base": 150,
    },
    "amsterdam": {
        "city": "Amsterdam", "country": "Netherlands", "lat": 52.3676, "lng": 4.9041,
        "neighborhoods": ["Jordaan", "Canal Ring", "De Pijp", "Oud-West", "Museum Quarter"],
        "price_base": 175,
    },
    "sydney": {
        "city": "Sydney", "country": "Australia", "lat": -33.8688, "lng": 151.2093,
        "neighborhoods": ["Bondi Beach", "Surry Hills", "Darlinghurst", "Manly", "Paddington", "Circular Quay"],
        "price_base": 185,
    },
    "singapore": {
        "city": "Singapore", "country": "Singapore", "lat": 1.3521, "lng": 103.8198,
        "neighborhoods": ["Marina Bay", "Orchard Road", "Tanjong Pagar", "Tiong Bahru", "Clarke Quay"],
        "price_base": 195,
    },
    "bangkok": {
        "city": "Bangkok", "country": "Thailand", "lat": 13.7563, "lng": 100.5018,
        "neighborhoods": ["Sukhumvit", "Siam", "Riverside", "Thonglor", "Silom", "Sathorn"],
        "price_base": 95,
    },
    "santorini": {
        "city": "Santorini", "country": "Greece", "lat": 36.3932, "lng": 25.4615,
        "neighborhoods": ["Oia", "Fira", "Imerovigli", "Firostefani", "Akrotiri"],
        "price_base": 260,
    },
    "mumbai": {
        "city": "Mumbai", "country": "India", "lat": 19.0760, "lng": 72.8777,
        "neighborhoods": ["Bandra West", "Juhu Beach", "Colaba", "Marine Drive", "Worli Sea Face", "Parel"],
        "price_base": 110,
    },
    "delhi": {
        "city": "Delhi", "country": "India", "lat": 28.6139, "lng": 77.2090,
        "neighborhoods": ["Hauz Khas Village", "Connaught Place", "Vasant Vihar", "Greater Kailash", "Sundar Nagar"],
        "price_base": 90,
    },
    "bengaluru": {
        "city": "Bengaluru", "country": "India", "lat": 12.9716, "lng": 77.5946,
        "neighborhoods": ["Indiranagar", "Koramangala", "Lavelle Road", "Whitefield", "Sadashivanagar"],
        "price_base": 85,
    },
    "puducherry": {
        "city": "Puducherry", "country": "India", "lat": 11.9416, "lng": 79.8083,
        "neighborhoods": ["White Town", "French Heritage Quarter", "Promenade Beach", "Auroville Forest"],
        "price_base": 95,
    },
    "chennai": {
        "city": "Chennai", "country": "India", "lat": 13.0827, "lng": 80.2707,
        "neighborhoods": ["Mylapore", "Besant Nagar", "Nungambakkam", "Alwarpet", "Adyar", "Boat Club"],
        "price_base": 75,
    },
    "vellore": {
        "city": "Vellore", "country": "India", "lat": 12.9165, "lng": 79.1325,
        "neighborhoods": ["Vellore Fort Quarter", "Sripuram Heritage", "Katpadi", "Bagayam", "Gandhi Nagar"],
        "price_base": 65,
    },
    "jaipur": {
        "city": "Jaipur", "country": "India", "lat": 26.9124, "lng": 75.7873,
        "neighborhoods": ["Civil Lines", "C-Scheme", "Old Pink City", "Bani Park", "Amer Valley"],
        "price_base": 105,
    },
    "zurich": {
        "city": "Zurich", "country": "Switzerland", "lat": 47.3769, "lng": 8.5417,
        "neighborhoods": ["Old Town Altstadt", "Enge Lakefront", "Seefeld", "Wiedikon", "Fluntern"],
        "price_base": 250,
    },
    "vienna": {
        "city": "Vienna", "country": "Austria", "lat": 48.2082, "lng": 16.3738,
        "neighborhoods": ["Innere Stadt", "Neubau", "Leopoldstadt", "Spittelberg"],
        "price_base": 140,
    },
    "prague": {
        "city": "Prague", "country": "Czech Republic", "lat": 50.0755, "lng": 14.4378,
        "neighborhoods": ["Old Town Square", "Malá Strana", "Vinohrady", "Karlín"],
        "price_base": 115,
    },
    "berlin": {
        "city": "Berlin", "country": "Germany", "lat": 52.5200, "lng": 13.4050,
        "neighborhoods": ["Mitte", "Prenzlauer Berg", "Kreuzberg", "Charlottenburg", "Friedrichshain"],
        "price_base": 130,
    },
    "san francisco": {
        "city": "San Francisco", "country": "United States", "lat": 37.7749, "lng": -122.4194,
        "neighborhoods": ["Pacific Heights", "Mission District", "SoMa", "Nob Hill", "Marina District"],
        "price_base": 220,
    },
    "los angeles": {
        "city": "Los Angeles", "country": "United States", "lat": 34.0522, "lng": -118.2437,
        "neighborhoods": ["Venice Canals", "Beverly Hills", "Silver Lake", "Hollywood Hills", "Santa Monica"],
        "price_base": 210,
    },
    "chicago": {
        "city": "Chicago", "country": "United States", "lat": 41.8781, "lng": -87.6298,
        "neighborhoods": ["Lincoln Park", "West Loop", "Gold Coast", "River North", "Wicker Park"],
        "price_base": 165,
    },
    "miami": {
        "city": "Miami", "country": "United States", "lat": 25.7617, "lng": -80.1918,
        "neighborhoods": ["South Beach", "Brickell", "Wynwood Arts", "Coconut Grove", "Design District"],
        "price_base": 230,
    },
    "toronto": {
        "city": "Toronto", "country": "Canada", "lat": 43.6532, "lng": -79.3832,
        "neighborhoods": ["Yorkville", "Downtown Core", "King West", "The Annex", "Distillery District"],
        "price_base": 160,
    },
    "vancouver": {
        "city": "Vancouver", "country": "Canada", "lat": 49.2827, "lng": -123.1207,
        "neighborhoods": ["Yaletown", "Gastown", "Kitsilano Beach", "West End", "Coal Harbour"],
        "price_base": 175,
    },
    "florence": {
        "city": "Florence", "country": "Italy", "lat": 43.7696, "lng": 11.2558,
        "neighborhoods": ["Duomo Quarter", "Oltrarno", "Santa Croce", "San Lorenzo", "Ponte Vecchio"],
        "price_base": 165,
    },
    "venice": {
        "city": "Venice", "country": "Italy", "lat": 45.4408, "lng": 12.3155,
        "neighborhoods": ["San Marco", "Cannaregio", "Dorsoduro", "Grand Canal", "Castello"],
        "price_base": 200,
    },
    "madrid": {
        "city": "Madrid", "country": "Spain", "lat": 40.4168, "lng": -3.7038,
        "neighborhoods": ["Salamanca", "Malasaña", "Chueca", "La Latina", "Retiro"],
        "price_base": 140,
    },
    "lisbon": {
        "city": "Lisbon", "country": "Portugal", "lat": 38.7223, "lng": -9.1393,
        "neighborhoods": ["Alfama", "Chiado", "Bairro Alto", "Príncipe Real", "Baixa"],
        "price_base": 135,
    },
    "kyoto": {
        "city": "Kyoto", "country": "Japan", "lat": 35.0116, "lng": 135.7681,
        "neighborhoods": ["Gion Historic", "Higashiyama", "Arashiyama Bamboo", "Pontocho Alley"],
        "price_base": 155,
    },
    "seoul": {
        "city": "Seoul", "country": "South Korea", "lat": 37.5665, "lng": 126.9780,
        "neighborhoods": ["Gangnam", "Hongdae", "Itaewon", "Myeongdong", "Bukchon Hanok"],
        "price_base": 130,
    },
    "cairo": {
        "city": "Cairo", "country": "Egypt", "lat": 30.0444, "lng": 31.2357,
        "neighborhoods": ["Zamalek Island", "Downtown Nile View", "Maadi Garden", "Giza View"],
        "price_base": 85,
    },
    "cape town": {
        "city": "Cape Town", "country": "South Africa", "lat": -33.9249, "lng": 18.4241,
        "neighborhoods": ["Camps Bay Beachfront", "V&A Waterfront", "Sea Point Promenade", "Clifton Oceanview"],
        "price_base": 170,
    },
    "istanbul": {
        "city": "Istanbul", "country": "Turkey", "lat": 41.0082, "lng": 28.9784,
        "neighborhoods": ["Bosphorus Waterfront", "Beyoğlu", "Sultanahmet", "Karaköy", "Nişantaşı"],
        "price_base": 115,
    },
}

# Rich photographic sets with verified high-res architectural & interior photography
PHOTO_THEMES = [
    # 1. Luxury Skyline & Penthouse
    [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
    # 2. Historic European Designer Loft
    [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80",
    ],
    # 3. Modern Villa with Pool & Terrace
    [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    ],
    # 4. Sunlit Minimalist Apartment
    [
        "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1554995207-c18c20360250?auto=format&fit=crop&w=1200&q=80",
    ],
    # 5. Waterfront / Coastal Retreat
    [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1510414842594-a61752af3337?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    # 6. Charming Boutique Studio
    [
        "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80",
    ],
]

LISTING_CONFIGS = [
    {
        "title_template": "The Glasshouse Penthouse with Panoramic Views in {neighborhood}",
        "desc_template": "Welcome to an extraordinary high-floor residence situated in the prime {neighborhood} area of {city}. Designed with floor-to-ceiling glass, custom walnut cabinetry, Italian marble bathrooms, and a private wraparound terrace offering unobstructed 360-degree vistas.",
        "prop_type": "Entire rental unit",
        "category": "Iconic cities",
        "guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 2.0, "price_mult": 1.45,
    },
    {
        "title_template": "Historic Architectural Oasis in Central {neighborhood}",
        "desc_template": "Step into restored elegance located in the historic heart of {city}'s {neighborhood}. Featuring exposed heritage stone, original soaring beam ceilings, curated mid-century furnishings, and high-speed fiber internet for a blissful getaway.",
        "prop_type": "Entire loft",
        "category": "Design",
        "guests": 2, "bedrooms": 1, "beds": 1, "bathrooms": 1.0, "price_mult": 1.10,
    },
    {
        "title_template": "Luxury Private Villa with Heated Pool & Garden in {neighborhood}",
        "desc_template": "An oasis of tranquility surrounded by lush landscaping in prestigious {neighborhood}, {city}. Features a private infinity swimming pool, alfresco dining pavilion, chef kitchen with state-of-the-art appliances, and master suite with soaking tub.",
        "prop_type": "Entire villa",
        "category": "Amazing pools",
        "guests": 6, "bedrooms": 3, "beds": 4, "bathrooms": 3.0, "price_mult": 1.85,
    },
    {
        "title_template": "Sunlit Designer Haven near {city} Promenade in {neighborhood}",
        "desc_template": "Bathed in natural morning light, this quiet sanctuary in {neighborhood} blends contemporary minimalism with warm organic textiles. Walkable to fine dining, artisan bakeries, and vibrant cultural landmarks of {city}.",
        "prop_type": "Entire rental unit",
        "category": "Trending",
        "guests": 3, "bedrooms": 1, "beds": 2, "bathrooms": 1.0, "price_mult": 0.95,
    },
    {
        "title_template": "The Waterfront Manor & Private Balcony in {neighborhood}",
        "desc_template": "Experience breathtaking views right from your private sun deck in {neighborhood}, {city}. Perfectly styled with nautical accents, plush king-size bedding, smart climate control, and direct waterfront access.",
        "prop_type": "Entire townhouse",
        "category": "Beachfront",
        "guests": 5, "bedrooms": 2, "beds": 3, "bathrooms": 2.5, "price_mult": 1.30,
    },
    {
        "title_template": "Chic Parisian-Style Atelier Loft in {neighborhood}",
        "desc_template": "A bespoke retreat designed by award-winning architects in {neighborhood}, {city}. Features curated art pieces, a bespoke vinyl record listening corner, a sun-drenched breakfast nook, and spa-grade rainfall showers.",
        "prop_type": "Entire loft",
        "category": "Luxe",
        "guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 1.5, "price_mult": 1.25,
    },
]

REVIEW_TEMPLATES = [
    ("Sophie Martin", "Staying here made our trip to {city} completely unforgettable! The view from the balcony is breathtaking, and the interior is even better than the photos. Flawless hospitality."),
    ("David Kim", "Spotless, extremely comfortable bed, and the location in {neighborhood} is perfect. Walking distance to great cafes and transport. Will definitely stay here again!"),
    ("Emma Watson", "Outstanding experience from check-in to check-out. The host gave exceptional local recommendations for {city}. 10/10 recommendation!"),
    ("Carlos Silva", "The design aesthetic is pure perfection. Quiet, peaceful, yet right in the heart of everything. Fast Wifi was great for remote working as well."),
]

def ensure_listings_for_location(db: Session, location_query: str) -> None:
    """
    Checks if listings exist for location_query. If not, generates and persists
    6 realistic, photo-rich listings tailored to that city and country in SQLite.
    """
    if not location_query or not location_query.strip():
        return

    clean_query = location_query.strip().lower()
    # Normalize common suffixes like "city", "town", "downtown", etc.
    simplified = re.sub(r"\b(city|town|downtown|center|centre|area|district|province|state|bay)\b", "", clean_query, flags=re.IGNORECASE).strip()
    
    # Split by comma or slash (e.g. "Paris, France" -> ["paris", "france"])
    tokens = [t.strip() for t in re.split(r"[,/]+", clean_query) if t.strip()]
    city_token = tokens[0] if tokens else clean_query
    city_token_simp = re.sub(r"\b(city|town|downtown|center|centre|area|district|province|state|bay)\b", "", city_token, flags=re.IGNORECASE).strip()

    NON_CITY_KEYWORDS = {
        "spa", "massage", "chef", "cooking", "safari", "tour", "photo", "photography",
        "chauffeur", "housekeeping", "cleaning", "wine", "yoga", "flight",
        "boat", "yacht", "cruise", "tasting", "balloon", "kayak", "dinner",
        "breakfast", "service", "services", "experience", "experiences", "stay", "stays",
        "facial", "wellness", "sommelier", "concierge", "luggage", "bar", "drinks"
    }
    check_key = city_token_simp or clean_query
    if check_key.lower() in NON_CITY_KEYWORDS or any(kw in check_key.lower() for kw in ("massage", "chef", "chauffeur", "spa", "yoga")):
        return

    # Avoid generating cities for single keystrokes like "p" or "pa"
    if len(check_key) < 3 and check_key not in ("goa", "oia", "ny", "la"):
        return

    # Check if we already have listings matching this city or country
    check_terms = set()
    for t in [clean_query, simplified, city_token, city_token_simp]:
        if t and len(t) >= 3:
            check_terms.add(t)

    loc_filters = []
    for t in check_terms:
        loc_filters.append(
            Listing.city.ilike(f"%{t}%") | Listing.country.ilike(f"%{t}%") | Listing.title.ilike(f"%{t}%")
        )

    if loc_filters:
        count = db.query(Listing).filter(or_(*loc_filters)).count()
        if count >= 3:
            # We already have sufficient listings
            return

    # Lookup city details in WORLD_CITIES
    city_data = None
    search_keys = [city_token_simp, city_token, simplified, clean_query]
    for sk in search_keys:
        if not sk or len(sk) < 2:
            continue
        for k, data in WORLD_CITIES.items():
            if k == sk or k in sk or sk in k:
                city_data = data
                break
        if city_data:
            break

    if not city_data:
        # Synthesize realistic details for ANY arbitrary worldwide city/town
        base_name = city_token_simp if (city_token_simp and len(city_token_simp) >= 3) else city_token
        norm_name = base_name.title()
        # Guess country from tokens if provided (e.g. "Geneva, Switzerland")
        country_name = tokens[1].title() if len(tokens) > 1 else "Worldwide Destination"
        # Generate stable pseudo-coordinates using hash
        h = abs(hash(norm_name.lower()))
        pseudo_lat = round(10.0 + (h % 5000) / 100.0, 4)
        pseudo_lng = round(-120.0 + ((h >> 4) % 24000) / 100.0, 4)

        city_data = {
            "city": norm_name,
            "country": country_name,
            "lat": pseudo_lat,
            "lng": pseudo_lng,
            "neighborhoods": [
                f"{norm_name} City Center",
                f"Historic {norm_name} Old Town",
                f"Uptown {norm_name}",
                f"{norm_name} Heritage District",
                f"West {norm_name}",
                f"{norm_name} Riverfront",
            ],
            "price_base": 135,
        }

    city_name = city_data["city"]
    country_name = city_data["country"]
    base_lat = city_data["lat"]
    base_lng = city_data["lng"]
    neighborhoods = city_data["neighborhoods"]
    base_price = city_data.get("price_base", 140)

    # Fetch available amenities and users
    amenities = db.query(Amenity).all()
    amenity_ids = [a.id for a in amenities]
    hosts = db.query(User).filter(User.role == "host").all()
    if not hosts:
        hosts = db.query(User).all()
    host_id = hosts[0].id if hosts else 1

    users = db.query(User).filter(User.role == "guest").all()
    guest_ids = [u.id for u in users] if users else [1]

    # Generate 6 diverse, high-fidelity listings
    for i, cfg in enumerate(LISTING_CONFIGS):
        neigh = neighborhoods[i % len(neighborhoods)]
        title = cfg["title_template"].format(neighborhood=neigh, city=city_name)
        desc = cfg["desc_template"].format(neighborhood=neigh, city=city_name)
        
        # Slight coordinate jitter within neighborhood (~500m to 1.5km)
        lat = round(base_lat + (random.uniform(-0.02, 0.02)), 6)
        lng = round(base_lng + (random.uniform(-0.02, 0.02)), 6)
        
        nightly_price = round(base_price * cfg["price_mult"] + random.randint(-8, 12), 2)
        rating = round(random.uniform(4.88, 4.98), 2)
        review_count = random.randint(18, 142)

        new_listing = Listing(
            host_id=host_id,
            title=title,
            description=desc,
            property_type=cfg["prop_type"],
            category=cfg["category"],
            address=f"{random.randint(12, 180)} {neigh} Way",
            city=city_name,
            country=country_name,
            latitude=lat,
            longitude=lng,
            price_per_night=nightly_price,
            cleaning_fee=round(nightly_price * 0.22, 2),
            service_fee=round(nightly_price * 0.14, 2),
            max_guests=cfg["guests"],
            bedrooms=cfg["bedrooms"],
            beds=cfg["beds"],
            bathrooms=cfg["bathrooms"],
            rating=rating,
            review_count=review_count,
            is_superhost=(i % 2 == 0),
        )

        # Attach 5-8 relevant amenities
        if amenity_ids:
            picked_amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids[:8])).all()
            new_listing.amenities = picked_amenities

        db.add(new_listing)
        db.flush()  # To obtain new_listing.id

        # Attach 5 high-res photos
        theme_photos = PHOTO_THEMES[i % len(PHOTO_THEMES)]
        for order, img_url in enumerate(theme_photos):
            img = ListingImage(
                listing_id=new_listing.id,
                image_url=img_url,
                caption=f"{city_name} Residence View {order + 1}",
                display_order=order,
            )
            db.add(img)

        # Add 2 realistic reviews
        for r_user, r_text in REVIEW_TEMPLATES[:2]:
            rev = Review(
                listing_id=new_listing.id,
                user_id=guest_ids[0],
                rating=5.0,
                cleanliness=5.0,
                accuracy=5.0,
                check_in_rating=5.0,
                communication=5.0,
                location_rating=5.0,
                value_rating=4.9,
                comment=r_text.format(city=city_name, neighborhood=neigh),
                created_at=datetime.utcnow() - timedelta(days=random.randint(5, 60)),
            )
            db.add(rev)

    db.commit()

def ensure_experiences_for_location(db: Session, location_query: str):
    """
    Dynamically generates and persists verified local experiences for any searched city/region
    if none currently exist in the database.
    """
    if not location_query or not location_query.strip():
        return

    clean_query = location_query.strip()
    tokens = [t.strip() for t in re.split(r"[,/]+", clean_query) if t.strip()]
    city_token = tokens[0] if tokens else clean_query
    city_clean = re.sub(
        r"\b(city|town|downtown|center|centre|area|district|state|province|bay)\b",
        "",
        city_token,
        flags=re.IGNORECASE
    ).strip()
    if not city_clean:
        city_clean = city_token

    # Check if experiences already exist for this city/location
    existing_count = db.query(Experience.id).filter(
        or_(
            Experience.city.ilike(f"%{city_clean}%"),
            Experience.location.ilike(f"%{city_clean}%"),
            Experience.title.ilike(f"%{city_clean}%"),
        )
    ).count()
    if existing_count >= 2:
        return

    # Find a valid host ID
    hosts = db.query(User).filter(User.role == "host").all()
    if not hosts:
        hosts = db.query(User).all()
    host_id = hosts[0].id if hosts else 1

    # Special curated experiences for Chennai
    if "chennai" in city_clean.lower():
        chennai_exps = [
            Experience(
                host_id=host_id,
                title="Mylapore Heritage & Kapaleeshwarar Temple Spiritual Walk",
                description="Stroll through the vibrant 7th-century Dravidian temple district of Mylapore. Admire the soaring Kapaleeshwarar gopuram, witness sacred morning rituals, hear stories of ancient Chola architecture, and sample authentic South Indian filter coffee in bronze davarahs.",
                category="Arts & Culture",
                badge="Daily · 6:30 AM",
                city="Chennai",
                country="India",
                location="Mylapore Heritage Quarter, Chennai, India",
                latitude=13.0336,
                longitude=80.2699,
                price_per_person=1200.0,
                duration_hours=2.5,
                group_size=8,
                language="English, Tamil",
                rating=4.98,
                review_count=112,
                image_url="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
            ),
            Experience(
                host_id=host_id,
                title="Marina Beach Sunset Promenade & Coastal Street Food Trail",
                description="Feel the ocean breeze along the world's second-longest urban beach. Taste crisp piping-hot sundal, chilli bajjis, fresh roasted corn with lime masala, and pan-seared coastal catch prepared by legendary seaside cooks.",
                category="Food & Drink",
                badge="Fri · 5:00 PM",
                city="Chennai",
                country="India",
                location="Marina Promenade, Chennai, India",
                latitude=13.0500,
                longitude=80.2824,
                price_per_person=1500.0,
                duration_hours=3.0,
                group_size=10,
                language="English, Hindi, Tamil",
                rating=4.96,
                review_count=94,
                image_url="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
            ),
            Experience(
                host_id=host_id,
                title="Classical Carnatic Music & Bharatanatyam Heritage Workshop",
                description="Discover the heart of South Indian classical arts. Meet renowned musicians, explore ancient talas and ragas on the veena and mridangam, and witness an expressive live Bharatanatyam mudra demonstration in an open-air pavilion.",
                category="Arts & Culture",
                badge="Sat · 4:00 PM",
                city="Chennai",
                country="India",
                location="Kalakshetra & Besant Nagar, Chennai, India",
                latitude=13.0012,
                longitude=80.2655,
                price_per_person=2200.0,
                duration_hours=2.5,
                group_size=6,
                language="English, Tamil",
                rating=4.99,
                review_count=78,
                image_url="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
            ),
            Experience(
                host_id=host_id,
                title="Traditional South Indian Filter Coffee & Tiffin Masterclass",
                description="Master the art of brewing aromatic chicory-infused filter kaapi with traditional brass filters. Learn to froth milk from arm's length heights, and prepare cloud-soft idlis, crisp medu vadas, and fiery coconut chutneys.",
                category="Food & Drink",
                badge="Sun · 8:30 AM",
                city="Chennai",
                country="India",
                location="T. Nagar & Alwarpet, Chennai, India",
                latitude=13.0418,
                longitude=80.2341,
                price_per_person=950.0,
                duration_hours=2.0,
                group_size=8,
                language="English, Hindi, Tamil",
                rating=4.97,
                review_count=135,
                image_url="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
            ),
            Experience(
                host_id=host_id,
                title="Mahabalipuram UNESCO Shore Temple & Stone Carving Expedition",
                description="Journey down the scenic coastal East Coast Road to UNESCO world heritage monolithic rock shrines. Explore Arjuna's Penance, the dramatic oceanfront Shore Temple, and try your hand at granite chiseling with master sculptors.",
                category="Nature & Outdoors",
                badge="Daily · 7:00 AM",
                city="Chennai",
                country="India",
                location="East Coast Road & Mahabalipuram, Chennai, India",
                latitude=12.6269,
                longitude=80.1927,
                price_per_person=3200.0,
                duration_hours=5.0,
                group_size=10,
                language="English, French, Tamil",
                rating=5.0,
                review_count=160,
                image_url="https://images.unsplash.com/photo-1600100397608-f010f443315a?auto=format&fit=crop&w=800&q=80",
            ),
        ]
        for exp in chennai_exps:
            db.add(exp)
        db.commit()
        return

    # General city generator for any destination worldwide
    norm_city = city_clean.title()
    matched_city = None
    for k, data in WORLD_CITIES.items():
        if k in city_clean.lower() or city_clean.lower() in k:
            matched_city = data
            break

    country_name = matched_city["country"] if matched_city else (tokens[1].title() if len(tokens) > 1 else "Worldwide Destination")
    base_lat = matched_city["lat"] if matched_city else 20.0
    base_lng = matched_city["lng"] if matched_city else 78.0

    generic_templates = [
        {
            "title": f"Historic {norm_city} Old Town & Heritage Architecture Walk",
            "desc": f"Explore the rich cultural tapestry and historic landmarks of {norm_city} with an expert local guide. Uncover hidden architectural courtyards, monuments, and timeless local lore.",
            "category": "Arts & Culture",
            "badge": "Sat · 9:00 AM",
            "price": 1800.0,
            "duration": 2.5,
            "image": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": f"{norm_city} Street Food Safari & Authentic Culinary Tasting",
            "desc": f"Taste the most celebrated culinary staples across vibrant food stalls in {norm_city}. Sample authentic local dishes, regional specialties, and artisan snacks with a foodie host.",
            "category": "Food & Drink",
            "badge": "Fri · 6:00 PM",
            "price": 2200.0,
            "duration": 3.0,
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": f"Golden Hour Sunset Photography & Scenic {norm_city} Viewpoints",
            "desc": f"Capture stunning panoramic vistas of {norm_city} during magical golden hour. Receive personalized lighting and composition mentorship from a seasoned local photographer.",
            "category": "Arts & Culture",
            "badge": "Daily · 5:30 PM",
            "price": 2500.0,
            "duration": 2.0,
            "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": f"Scenic Nature Trail & Outdoor Landscapes of {norm_city}",
            "desc": f"Get away from the bustle and trek scenic scenic ridges, lush groves, and historic lookout points overlooking the greater {norm_city} region.",
            "category": "Nature & Outdoors",
            "badge": "Sun · 7:00 AM",
            "price": 1950.0,
            "duration": 3.5,
            "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        },
    ]

    for tmpl in generic_templates:
        db.add(Experience(
            host_id=host_id,
            title=tmpl["title"],
            description=tmpl["desc"],
            category=tmpl["category"],
            badge=tmpl["badge"],
            city=norm_city,
            country=country_name,
            location=f"{norm_city} Heritage Center, {country_name}",
            latitude=base_lat,
            longitude=base_lng,
            price_per_person=tmpl["price"],
            duration_hours=tmpl["duration"],
            group_size=8,
            language="English",
            rating=round(random.uniform(4.93, 4.99), 2),
            review_count=random.randint(45, 120),
            image_url=tmpl["image"],
        ))
    db.commit()


# Curated services definitions for major Indian cities
MAJOR_INDIAN_SERVICES = {
    "chennai": [
        {
            "title": "Authentic South Indian & Chettinad Feast Private Chef",
            "desc": "Master culinary chef prepares fragrant Chettinad chicken, Mylapore Brahmin tiffin, crispy paper roast dosas, and fresh coastal seafood cooked live on banana leaves in your residence.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Mylapore & ECR, Chennai, India",
            "price": 3200.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Traditional Ayurvedic Abhyanga & Warm Herbal Oil Therapy",
            "desc": "Certified Kerala and Tamil Ayurvedic practitioner brings heated herbal oils, wooden massage accessories, and relaxation therapy directly to your villa suite.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Besant Nagar & Alwarpet, Chennai, India",
            "price": 2800.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "East Coast Road (ECR) & Airport Luxury SUV Chauffeur",
            "desc": "Chauffeured Toyota Innova Crysta / Mercedes with flight tracking, chilled tender coconut water, and seamless beachside or city transit.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "Airport & ECR Coastal Corridor, Chennai, India",
            "price": 2400.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Mylapore Heritage & Marina Beach Vacation Photography",
            "desc": "Professional photographer captures vibrant memories against Kapaleeshwarar Temple spires, colonial San Thome, and golden hour Marina sands.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Marina Beach & San Thome, Chennai, India",
            "price": 3500.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Coastal Villa Deep Clean & Beachside Housekeeping",
            "desc": "Specialized beachfront sanitization, sand removal, crisp cotton linen turnover, and sparkling kitchen cleanup for your Chennai stay.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Kovalam & ECR Stays, Chennai, India",
            "price": 1800.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "bengaluru": [
        {
            "title": "Garden City Barbecue & Craft Microbrew Private Chef",
            "desc": "Curated artisanal barbecue skewers, wood-fired gourmet sliders, and fresh local brew pairings served on your penthouse terrace.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Indiranagar & Koramangala, Bengaluru, India",
            "price": 3800.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "In-Residence Deep Tissue & Swedish Stress-Relief Spa",
            "desc": "Rejuvenating muscular massage and aromatic facial care to unwind after exploring Karnataka's Silicon Valley.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Lavelle Road & Whitefield, Bengaluru, India",
            "price": 3000.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Kempegowda Airport VIP Transfer & City Chauffeur",
            "desc": "Executive luxury sedan with onboard Wi-Fi, refreshments, and prompt transfers through tech corridors and central Bengaluru.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "KIA Airport & CBD, Bengaluru, India",
            "price": 2900.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Cubbon Park & Colonial Bangalore Editorial Photoshoot",
            "desc": "Magazine-grade candid portrait session among lush bamboo canopies, Victorian bandstands, and historic tree-lined avenues.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Cubbon Park & MG Road, Bengaluru, India",
            "price": 3800.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Luxury Penthouse Turndown & Daily Housekeeping",
            "desc": "Five-star hotel standard sanitization, vacuuming, and organic Egyptian cotton linen refresh for your Bangalore stay.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "UB City & HSR Layout, Bengaluru, India",
            "price": 2200.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "mumbai": [
        {
            "title": "Coastal Konkani & Parsi Gourmet Private Chef Experience",
            "desc": "Savor fresh Arabian Sea catch, Konkan pomfret fry, patra ni machhi, and berry pulao prepared live in your sea-view kitchen.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Bandra West & Juhu, Mumbai, India",
            "price": 4200.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Arabian Sea View Aromatherapy & Hot Stone Massage",
            "desc": "Luxurious in-suite heated basalt stone treatment and lavender essential oil therapy for soothing relaxation.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Worli Sea Face & Marine Lines, Mumbai, India",
            "price": 3500.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Mumbai Airport & South Bombay Luxury Chauffeur",
            "desc": "Seamless door-to-door transit in a chauffeur-driven Mercedes-Benz across Bandra-Worli Sea Link and Colaba.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "CSMIA Airport & Colaba, Mumbai, India",
            "price": 3200.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Marine Drive & Gateway of India Golden Hour Photoshoot",
            "desc": "Cinematic lifestyle photography across the Queen's Necklace, Kala Ghoda art precinct, and heritage facades.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Marine Drive & Fort, Mumbai, India",
            "price": 4500.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "High-Rise Seafront Apartment Sanitization & Housekeeping",
            "desc": "Dust-free deep cleaning, sparkling balcony glass cleaning, and premium bed dressing for luxury Mumbai apartments.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Prabhadevi & Khar, Mumbai, India",
            "price": 2500.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "delhi": [
        {
            "title": "Royal Dilli 6 Mughlai & Kebab In-Residence Feast",
            "desc": "Authentic Purani Dilli style melt-in-mouth galouti kebabs, slow-simmered dum biryani, and saffron kheer served by veteran chefs.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "South Extension & Sundar Nagar, Delhi, India",
            "price": 3900.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Himalayan Singing Bowl & Rejuvenating In-Suite Spa",
            "desc": "Tibetan singing bowl sound immersion coupled with pressure-point herbal body massage for deep relaxation and stress relief.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Golf Links & Vasant Vihar, Delhi, India",
            "price": 3200.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Lutyens Delhi & IGI Airport Chauffeur Concierge",
            "desc": "Executive luxury chauffeur for terminal pickups, diplomatic enclave travel, and historic monuments across NCR.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "IGI Terminal 3 & Central Delhi, Delhi, India",
            "price": 2800.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Monuments & Lodhi Art District Portrait Session",
            "desc": "Editorial photos among Mughal sandstone archways, Humayun's Tomb gardens, and vibrant Lodhi Colony street murals.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Lodhi Art District & Mehrauli, Delhi, India",
            "price": 4000.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Estate Villa Deep Clean & Mid-Stay Housekeeping",
            "desc": "Meticulous sanitization, wardrobe organizing, fresh crisp linen replacement, and kitchen detailing for NCR bungalows.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Hauz Khas & Gurgaon DLF, Delhi, India",
            "price": 2200.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "goa": [
        {
            "title": "Goan Portuguese Seafood & Beach Barbecue Private Chef",
            "desc": "Fresh tiger prawns, grilled kingfish, Goan fish curry, and warm bebinca cooked on your private pool patio.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Anjuna, Assagao & Candolim, Goa, India",
            "price": 4500.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "In-Villa Ayurvedic Panchakarma & Ocean Breeze Therapy",
            "desc": "Therapeutic warm coconut oil abhyanga and herbal body scrubs under swaying palms on your private villa terrace.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Vagator & Morjim, Goa, India",
            "price": 3400.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Goa Airport & Beach-Hopping Private SUV Chauffeur",
            "desc": "Comfortable air-conditioned SUV for seamless transfers between Dabolim/MOPA airports and North/South Goa shores.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "MOPA & Dabolim Airport Transfers, Goa, India",
            "price": 2600.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Sunset Beach & Latin Quarter Fontainhas Photoshoot",
            "desc": "Vibrant portraits amidst colorful Portuguese heritage villas in Panaji and dramatic golden-hour surf in Ashwem.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Fontainhas & Ashwem Beach, Goa, India",
            "price": 4200.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Beach Villa Sand Sweep & Post-Party Housekeeping",
            "desc": "Complete villa overhaul, pool terrace tidying, sand-free vacuuming, and fresh laundered linens.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Baga & Siolim Villas, Goa, India",
            "price": 2400.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "hyderabad": [
        {
            "title": "Royal Nizami Dastarkhwan & Dum Biryani Private Chef",
            "desc": "Authentic Kachchi Gosht slow-dum biryani, mirchi ka salan, mutton haleem, and double ka meetha prepared by Hyderabadi culinary masters.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Jubilee Hills & Banjara Hills, Hyderabad, India",
            "price": 3800.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Ayurvedic Marma Therapy & Herbal Rejuvenation",
            "desc": "Traditional energy-point massage with medicated oils to relieve travel fatigue and restore balanced vitality.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Madhapur & Gachibowli, Hyderabad, India",
            "price": 2900.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "RGIA Airport & Cyberabad Executive Chauffeur",
            "desc": "Priority VIP airport transfers and smooth rides through Hitec City, financial district, and historic old city quarters.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "Shamshabad Airport & Hitec City, Hyderabad, India",
            "price": 2700.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Golconda Fort & Charminar Heritage Photo Tour",
            "desc": "Royal portraiture and candid snapshots against centuries-old Deccan stonework, acoustic arches, and bustling Laad Bazaar.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Golconda & Charminar, Hyderabad, India",
            "price": 3800.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Jubilee Hills Luxury Residence Housekeeping",
            "desc": "Thorough room sanitization, marble floor polishing, kitchen detailing, and hotel-grade bed styling.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Banjara Hills Stays, Hyderabad, India",
            "price": 2100.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "jaipur": [
        {
            "title": "Royal Rajasthani Thali & Haveli Courtyard Private Chef",
            "desc": "Authentic Dal Baati Churma, Gatte ki Sabzi, Ker Sangri, and Laal Maas cooked with pure deshi ghee and served courtyard-style.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "C-Scheme & Civil Lines, Jaipur, India",
            "price": 3600.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Desert Rose & Sandalwood In-Room Spa Ritual",
            "desc": "Exfoliating rosehip and sandalwood scrub followed by relaxing pressure massage in your heritage room.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Bani Park & Malviya Nagar, Jaipur, India",
            "price": 3100.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Pink City Heritage Chauffeur & Palace Concierge",
            "desc": "Chauffeured luxury car with local tips for Amber Fort, Nahargarh sunset, and Johari Bazaar jewelry explorations.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "Jaipur Airport & Walled City, Jaipur, India",
            "price": 2500.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Amer Fort & Pink City Bazaars Editorial Photoshoot",
            "desc": "Stunning portraits against pink terracotta archways, ancient stepwells, and ornate palace balconies.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Amer Fort & Hawa Mahal, Jaipur, India",
            "price": 4000.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Heritage Haveli Daily Cleaning & Linen Care",
            "desc": "Careful preservation cleaning for antique furnishings, brass decor, and crisp cotton bedsheet change.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Old City Havelis, Jaipur, India",
            "price": 2000.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "kolkata": [
        {
            "title": "Zamindari Bengali Feast & Fresh River Catch Chef",
            "desc": "Authentic Kosha Mangsho, Daab Chingri, Bhetki Paturi, and warm Nolen Gur sweets prepared in-residence by veteran Kolkata cooks.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Ballygunge & Salt Lake, Kolkata, India",
            "price": 3400.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Holistic Aromatherapy & Herbal Foot Reflexology",
            "desc": "Relaxing essential oil body treatment and rejuvenating foot reflexology session to melt away sightseeing fatigue.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Alipore & Park Street, Kolkata, India",
            "price": 2600.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Kolkata Airport & Howrah VIP Chauffeur Concierge",
            "desc": "Air-conditioned premium transit through Park Street, Victoria Memorial, and city crossings with trained drivers.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "CCU Airport & Howrah Station, Kolkata, India",
            "price": 2300.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Vintage Kolkata Tramways & Ghats Photo Walk",
            "desc": "Nostalgic candid portraits with yellow ambassador cabs, Princep Ghat by the Hooghly river, and heritage tramlines.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Princep Ghat & North Kolkata, Kolkata, India",
            "price": 3600.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Boutique Apartment Deep Cleaning & Turnover",
            "desc": "Detailed scrubbing, dusting, fresh linen bed turnover, and kitchen care for heritage Kolkata flats.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "South Kolkata Stays, Kolkata, India",
            "price": 1900.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "pune": [
        {
            "title": "Maharashtrian Gourmet & Western Ghats Private Chef",
            "desc": "Authentic Kolhapuri delicacies, Malvani fish fry, freshly rolled puran poli, and seasonal farm salads prepared in your kitchen.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Koregaon Park & Kalyani Nagar, Pune, India",
            "price": 3400.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Koregaon Park In-Suite Swedish & De-Stress Massage",
            "desc": "Muscle-relaxing full body massage with warm almond oil in your private suite, perfect for weekend getaways.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Aundh & Viman Nagar, Pune, India",
            "price": 2800.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Pune-Mumbai Expressway & Airport Chauffeur",
            "desc": "Reliable long-distance and airport transfers with trained chauffeur, FASTag convenience, and sanitized luxury car.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "Pune Airport & Expressway, Pune, India",
            "price": 2600.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Old Pune Wada & Hilltop Sunset Photoshoot",
            "desc": "Memorable vacation and couple portraits with historic wooden carved wadas and scenic hill vistas.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Shaniwar Wada & ARAI Hills, Pune, India",
            "price": 3500.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Boutique Villa Housekeeping & Linen Care",
            "desc": "Spotless cleaning, sanitized bathrooms, and fresh bed linen service for quiet residential stays.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Baner & Balewadi Stays, Pune, India",
            "price": 1900.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "kochi": [
        {
            "title": "Kerala Banana Leaf Sadya & Coastal Seafood Chef",
            "desc": "Traditional 18-dish vegetarian Sadya or Karimeen Pollichathu wrapped in banana leaves and simmered coconut curries cooked in-villa.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Fort Kochi & Panampilly Nagar, Kochi, India",
            "price": 3500.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Authentic Keralite Herbal Kizhi & Abhyanga Spa",
            "desc": "Rejuvenating warm herbal poultice massage by trained local therapists using authentic Ayurvedic Dhanwantharam oil.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Mattancherry & Marine Drive, Kochi, India",
            "price": 3000.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Cochin Airport & Backwaters Chauffeur Concierge",
            "desc": "Chauffeured sedan or MPV to Kumarakom, Alleppey houseboats, and Fort Kochi with scenic backwater stopovers.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "CIAL Airport & Ernakulam, Kochi, India",
            "price": 2400.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Fort Kochi Chinese Nets & Colonial Street Shoot",
            "desc": "Atmospheric travel portraits with historic cantilevered fishing nets, spice godowns, and seaside sunsets.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Fort Kochi Beach & Jew Town, Kochi, India",
            "price": 3800.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Backwater Homestay Daily Housekeeping & Laundry",
            "desc": "Tropical villa cleaning, mosquito-safe linen setup, sparkling terrace dusting, and crisp towel refresh.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Kumbalangi & Fort Kochi, Kochi, India",
            "price": 1800.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "coimbatore": [
        {
            "title": "Kongunadu Heritage Cuisine In-Villa Chef",
            "desc": "Fragrant Pallipalayam chicken, coconut milk arisi paruppu sadam, and homemade elaneer payasam cooked fresh in your villa.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Race Course & RS Puram, Coimbatore, India",
            "price": 3000.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Western Ghats Foothills Herbal Healing Massage",
            "desc": "Restorative therapy with mountain herbal infusions and warm sesame oil to soothe tired muscles after hill treks.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Saibaba Colony & Avinashi Road, Coimbatore, India",
            "price": 2600.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Isha Yoga Center & Ooty Foothills Chauffeur",
            "desc": "Private AC car for visits to Adiyogi, Marudhamalai, Siruvani, and Nilgiri ghats with punctual pickup.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "CJB Airport & Velliangiri Foothills, Coimbatore, India",
            "price": 2500.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Foothill Nature & Temple Portrait Session",
            "desc": "Artistic portraits against misty hills, coconut plantations, and ancient Dravidian temple architecture.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Perur Temple & Foothills, Coimbatore, India",
            "price": 3200.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Estate Cottage Housekeeping & Fresh Turnover",
            "desc": "Complete room cleaning, linen change, and patio dusting for serene foothill cottages.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Saravanampatti & Peelamedu, Coimbatore, India",
            "price": 1700.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "ahmedabad": [
        {
            "title": "Royal Kathiyawadi & Gujarati Thali Private Chef",
            "desc": "Steaming sev tameta nu shaak, bajra rotla, ringna no olo, khichdi kadhi, and warm jalebi made fresh on your patio.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Bodakdev & Satellite, Ahmedabad, India",
            "price": 3200.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Rejuvenating In-Room Herbal Massage & Reflexology",
            "desc": "Relaxing holistic session using natural sesame and sandalwood oils to unwind after cultural tours.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Vastrapur & Prahlad Nagar, Ahmedabad, India",
            "price": 2700.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Ahmedabad Airport & Heritage City Chauffeur",
            "desc": "Air-conditioned transfers to Sabarmati Ashram, Gandhinagar, and historic UNESCO pols with verified drivers.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "AMD Airport & SG Highway, Ahmedabad, India",
            "price": 2200.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "UNESCO Old City Pols & Adalaj Stepwell Photoshoot",
            "desc": "Intricate architectural portraits in ancient stepwells and carved wooden havelis of old Ahmedabad.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Adalaj Stepwell & Old Pols, Ahmedabad, India",
            "price": 3600.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Modern Apartment Deep Clean & Linen Refresh",
            "desc": "Dusting, sanitizing, kitchen tidying, and clean cotton bed linen setup for modern apartments.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Thaltej & Bopal Stays, Ahmedabad, India",
            "price": 1800.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "chandigarh": [
        {
            "title": "Authentic Punjabi Tandoori & Dhaba Feast Chef",
            "desc": "Charcoal-smoked butter chicken, dal makhani, Amritsari kulchas, rumali rotis, and kulhad kheer served fresh.",
            "category": "Dining & Chefs",
            "service_type": "In-Residence Dining",
            "location": "Sector 9 & Sector 10, Chandigarh, India",
            "price": 3600.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Restorative Deep Muscle Relief & Head Massage",
            "desc": "Classic Ayurvedic champi and deep pressure therapy for complete head, neck, and back rejuvenation.",
            "category": "Wellness & Spa",
            "service_type": "Mobile Spa",
            "location": "Sector 35 & Mohali, Chandigarh, India",
            "price": 2800.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Chandigarh Airport & Himachal Foothills Chauffeur",
            "desc": "Comfortable luxury car for transfers across the tri-city, Kalka railway, and foothills with courteous chauffeur.",
            "category": "Transport",
            "service_type": "Private Chauffeur",
            "location": "IXC Airport & Tri-City Corridor, Chandigarh, India",
            "price": 2600.0,
            "unit": "trip",
            "image": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Rock Garden & Sukhna Lake Golden Hour Shoot",
            "desc": "Creative lifestyle photography at Le Corbusier modern architecture, mosaic rock sculpture paths, and tranquil lake.",
            "category": "Photography",
            "service_type": "On-Location",
            "location": "Rock Garden & Sukhna Lake, Chandigarh, India",
            "price": 3500.0,
            "unit": "session",
            "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        },
        {
            "title": "Sector Bungalow Sanitization & Housekeeping",
            "desc": "Comprehensive property cleaning, veranda sweeping, and fresh hotel-style linens.",
            "category": "Housekeeping",
            "service_type": "Cleaning & Linens",
            "location": "Sector 8 & Panchkula, Chandigarh, India",
            "price": 2000.0,
            "unit": "service",
            "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        },
    ],
}


def ensure_services_for_location(db: Session, location: str):
    """
    Ensure relevant in-residence services exist for major Indian cities.
    Other cities (non-major cities like Vellore, Salem, etc.) intentionally have NO services so that
    the frontend displays the 'Services aren't available in [City] yet' empty state as requested.
    """
    if not location or not location.strip():
        return

    tokens = [t.strip() for t in re.split(r"[,/]", location) if t.strip()]
    if not tokens:
        return
    city_clean = tokens[0].lower()

    CITY_ALIAS_MAP = {
        "chennai": "chennai",
        "madras": "chennai",
        "bengaluru": "bengaluru",
        "bangalore": "bengaluru",
        "mumbai": "mumbai",
        "bombay": "mumbai",
        "delhi": "delhi",
        "new delhi": "delhi",
        "ncr": "delhi",
        "gurgaon": "delhi",
        "gurugram": "delhi",
        "noida": "delhi",
        "goa": "goa",
        "panaji": "goa",
        "hyderabad": "hyderabad",
        "secunderabad": "hyderabad",
        "jaipur": "jaipur",
        "kolkata": "kolkata",
        "calcutta": "kolkata",
        "pune": "pune",
        "kochi": "kochi",
        "cochin": "kochi",
        "coimbatore": "coimbatore",
        "ahmedabad": "ahmedabad",
        "chandigarh": "chandigarh",
    }

    matched_key = None
    for alias, canonical in CITY_ALIAS_MAP.items():
        if alias in city_clean or city_clean in alias:
            matched_key = canonical
            break

    # If NOT a major Indian city, DO NOT generate services!
    # This ensures other cities (Vellore, Salem, Madurai, etc.) show the unavailable screen.
    if not matched_key:
        return

    # Check if services already exist for this city
    display_city_name = matched_key.title()
    existing_count = db.query(Service).filter(
        or_(
            Service.city.ilike(f"%{matched_key}%"),
            Service.city.ilike(f"%{city_clean}%"),
            Service.location.ilike(f"%{matched_key}%"),
        )
    ).count()

    if existing_count >= 3:
        return

    # Get valid provider
    providers = db.query(User).filter(User.role == "host").all()
    if not providers:
        providers = db.query(User).all()
    prov_ids = [u.id for u in providers] if providers else [1]

    templates = MAJOR_INDIAN_SERVICES.get(matched_key, [])
    for idx, tmpl in enumerate(templates):
        pid = prov_ids[idx % len(prov_ids)]
        db.add(Service(
            provider_id=pid,
            title=tmpl["title"],
            description=tmpl["desc"],
            category=tmpl["category"],
            service_type=tmpl["service_type"],
            city=display_city_name,
            country="India",
            location=tmpl["location"],
            price=tmpl["price"],
            unit=tmpl["unit"],
            rating=round(random.uniform(4.94, 4.99), 2),
            review_count=random.randint(40, 115),
            image_url=tmpl["image"],
        ))

    db.commit()

