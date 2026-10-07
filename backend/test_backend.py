import os
import sys
from datetime import date, timedelta

# Add parent directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    print("PASS: Health check")

def test_city_search_precision():
    # 1. Search Paris
    res = client.get("/api/listings?location=Paris")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    for it in items:
        assert it["city"].lower() == "paris" or it["country"].lower() == "france", f"Non-Paris item: {it['title']} in {it['city']}"
    print(f"PASS: Paris search returned {len(items)} items strictly in Paris/France")

    # 2. Search Tokyo
    res = client.get("/api/listings?location=Tokyo")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    for it in items:
        assert it["city"].lower() == "tokyo" or it["country"].lower() == "japan", f"Non-Tokyo item: {it['title']} in {it['city']}"
    print(f"PASS: Tokyo search returned {len(items)} items strictly in Tokyo/Japan")

    # 3. Search Dubai
    res = client.get("/api/listings?location=Dubai")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    for it in items:
        assert it["city"].lower() == "dubai" or "emirates" in it["country"].lower(), f"Non-Dubai item: {it['title']} in {it['city']}"
    print(f"PASS: Dubai search returned {len(items)} items strictly in Dubai")

    # 4. Search Goa
    res = client.get("/api/listings?location=Goa")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    for it in items:
        assert it["city"].lower() == "goa", f"Non-Goa item: {it['title']} in {it['city']}"
    print(f"PASS: Goa search returned {len(items)} items strictly in Goa")

def test_listing_filters():
    # Price filter
    res = client.get("/api/listings?min_price=2000&max_price=4000")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    for it in items:
        assert 2000 <= it["price_per_night"] <= 4000
    print(f"PASS: Price filtering (2000 - 4000) returned {len(items)} valid listings")

    paginated = client.get("/api/listings?paginated=true&page=1&page_size=2")
    assert paginated.status_code == 200
    page_data = paginated.json()
    assert len(page_data["items"]) == 2
    assert page_data["page"] == 1
    assert page_data["page_size"] == 2
    assert page_data["total"] >= len(page_data["items"])
    assert page_data["has_next"] is True
    print("PASS: Listing pagination returns bounded items and page metadata")

    # Category filter
    res = client.get("/api/listings?category=Beachfront")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    for it in items:
        assert it["category"].lower() == "beachfront"
    print(f"PASS: Beachfront category filtering returned {len(items)} listings")

    # Guests filter
    res = client.get("/api/listings?guests=6")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    print(f"PASS: Guests capacity filter returned {len(items)} listings")

def test_booking_flow_and_conflict_prevention():
    today = date.today()
    check_in = today + timedelta(days=60)
    check_out = today + timedelta(days=64)

    # 1. Create a booking on listing 1
    booking_payload = {
        "listing_id": 1,
        "check_in": check_in.isoformat(),
        "check_out": check_out.isoformat(),
        "guests_count": 2
    }
    preview_res = client.post("/api/bookings/price-preview", json=booking_payload)
    assert preview_res.status_code == 200, f"Price preview failed: {preview_res.text}"
    quote = preview_res.json()
    assert quote["is_available"] is True
    assert quote["total_nights"] == 4
    invalid_guest_count = client.post(
        "/api/bookings?guest_id=1",
        json={**booking_payload, "guests_count": 0},
    )
    assert invalid_guest_count.status_code == 422

    res = client.post("/api/bookings?guest_id=1", json=booking_payload)
    assert res.status_code == 201, f"Booking creation failed: {res.text}"
    created_booking = res.json()
    booking_id = created_booking["id"]
    assert "booking_code" in created_booking
    assert created_booking["status"] == "confirmed"
    assert created_booking["total_price"] == quote["total_price"]
    print(f"PASS: Booking created with code {created_booking['booking_code']}")

    # 2. Attempt double booking on overlapping dates (should fail with 409 conflict)
    overlapping_payload = {
        "listing_id": 1,
        "check_in": (check_in + timedelta(days=1)).isoformat(),
        "check_out": (check_out + timedelta(days=2)).isoformat(),
        "guests_count": 2
    }
    conflicting_preview = client.post("/api/bookings/price-preview", json=overlapping_payload)
    assert conflicting_preview.status_code == 200
    assert conflicting_preview.json()["is_available"] is False

    conflict_res = client.post("/api/bookings?guest_id=4", json=overlapping_payload)
    assert conflict_res.status_code == 409, f"Expected 409 Conflict, got {conflict_res.status_code}"
    print("PASS: Overlapping booking correctly rejected with 409 Conflict!")

    checkout_res = client.post(
        f"/api/bookings/checkout?guest_id=1",
        json={"booking_id": booking_id, "payment_method": "card", "card_last_four": "4242"},
    )
    assert checkout_res.status_code == 200, f"Checkout failed: {checkout_res.text}"
    assert checkout_res.json()["success"] is True
    assert checkout_res.json()["total_charged"] == created_booking["total_price"]
    wrong_guest_checkout = client.post(
        "/api/bookings/checkout?guest_id=4",
        json={"booking_id": booking_id, "payment_method": "paypal"},
    )
    assert wrong_guest_checkout.status_code == 404

    # 3. Retrieve "My Trips"
    my_trips_res = client.get("/api/bookings/my?guest_id=1")
    assert my_trips_res.status_code == 200
    my_trips = my_trips_res.json()
    assert any(b["id"] == booking_id for b in my_trips)
    print(f"PASS: My Trips contains {len(my_trips)} bookings for guest 1")

    # 4. Cancel the booking
    unauthorized_cancel = client.delete(f"/api/bookings/{booking_id}?guest_id=4")
    assert unauthorized_cancel.status_code == 404
    cancel_res = client.delete(f"/api/bookings/{booking_id}?guest_id=1")
    assert cancel_res.status_code == 200
    print(f"PASS: Booking {booking_id} successfully cancelled")

def test_host_crud_operations():
    # 1. Create listing
    new_listing_data = {
        "title": "Automated Test Coastal Villa",
        "description": "Luxurious beachfront villa for automated testing validation.",
        "property_type": "Entire villa",
        "category": "Beachfront",
        "address": "Ocean Drive 99",
        "city": "Goa",
        "country": "India",
        "latitude": 15.5200,
        "longitude": 73.7600,
        "price_per_night": 3500.0,
        "cleaning_fee": 500.0,
        "service_fee": 400.0,
        "max_guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 2.5,
        "amenity_ids": [1, 2, 4],
        "images": [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
        ]
    }
    res = client.post("/api/listings?host_id=2", json=new_listing_data)
    assert res.status_code == 201, f"Listing create failed: {res.text}"
    created_listing = res.json()
    listing_id = created_listing["id"]
    print(f"PASS: Host created listing with ID {listing_id}")

    forbidden_update = client.put(
        f"/api/listings/{listing_id}?host_id=3",
        json={"title": "Unauthorized update attempt"},
    )
    assert forbidden_update.status_code == 403

    # 2. Update listing
    update_data = {
        "title": "Updated Test Coastal Villa with Sunset Deck",
        "price_per_night": 3800.0
    }
    update_res = client.put(f"/api/listings/{listing_id}", json=update_data)
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Test Coastal Villa with Sunset Deck"
    assert update_res.json()["price_per_night"] == 3800.0
    print(f"PASS: Listing {listing_id} updated successfully")

    # 3. Host dashboard stats
    stats_res = client.get("/api/host/stats?host_id=2")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_listings"] > 0
    print(f"PASS: Host stats: {stats}")

    # 4. Host listings list
    host_listings_res = client.get("/api/host/listings?host_id=2")
    assert host_listings_res.status_code == 200
    assert any(l["id"] == listing_id for l in host_listings_res.json())
    print("PASS: Host listings query verified")

    # 5. Delete listing
    forbidden_delete = client.delete(f"/api/listings/{listing_id}?host_id=3")
    assert forbidden_delete.status_code == 403
    delete_res = client.delete(f"/api/listings/{listing_id}")
    assert delete_res.status_code == 200
    # Verify 404 after deletion
    get_res = client.get(f"/api/listings/{listing_id}")
    assert get_res.status_code == 404
    print(f"PASS: Listing {listing_id} deleted and verified 404")

def test_reviews_flow():
    # Submit review
    review_data = {
        "rating": 5.0,
        "cleanliness": 5.0,
        "accuracy": 5.0,
        "check_in_rating": 5.0,
        "communication": 5.0,
        "location_rating": 5.0,
        "value_rating": 5.0,
        "comment": "Exceptional automated test stay! Spotless clean and highly recommended."
    }
    res = client.post("/api/listings/1/reviews?user_id=1", json=review_data)
    assert res.status_code == 201
    print("PASS: Review submitted successfully")

    # Get reviews
    reviews_res = client.get("/api/listings/1/reviews")
    assert reviews_res.status_code == 200
    assert len(reviews_res.json()) > 0
    print(f"PASS: Retrieved {len(reviews_res.json())} reviews for listing 1")

def test_wishlists_flow():
    # Toggle wishlist on listing 2
    toggle_res = client.post("/api/wishlists/2?user_id=1")
    assert toggle_res.status_code == 200
    assert "is_wishlisted" in toggle_res.json()
    print(f"PASS: Wishlist toggle returned {toggle_res.json()}")

    # Get wishlist items
    wishlist_res = client.get("/api/wishlists?user_id=1")
    assert wishlist_res.status_code == 200
    print(f"PASS: User has {len(wishlist_res.json())} wishlisted stays")

def test_experiences_api():
    # 1. Get all experiences
    res = client.get("/api/experiences")
    assert res.status_code == 200
    all_exp = res.json()
    assert len(all_exp) >= 12
    assert all("is_original" in experience for experience in all_exp)
    assert any(experience["is_original"] for experience in all_exp)
    print(f"PASS: Total experiences: {len(all_exp)}")

    # 2. Filter by location: Dubai
    dubai_exp = client.get("/api/experiences?location=Dubai").json()
    assert len(dubai_exp) >= 2
    for e in dubai_exp:
        assert e["city"].lower() == "dubai"
    print(f"PASS: Dubai experiences ({len(dubai_exp)}) verified")

    # 3. Filter by location: Kyoto
    kyoto_exp = client.get("/api/experiences?location=Kyoto").json()
    assert len(kyoto_exp) >= 1
    assert "matcha" in kyoto_exp[0]["title"].lower()
    print(f"PASS: Kyoto matcha experience verified")

    # 4. Search query: pasta
    pasta_exp = client.get("/api/experiences?search=pasta").json()
    assert len(pasta_exp) >= 1
    assert "pasta" in pasta_exp[0]["title"].lower()
    print(f"PASS: Pasta cooking experience verified")

    # 5. Search location: Chennai
    chennai_exp = client.get("/api/experiences?location=Chennai").json()
    assert len(chennai_exp) >= 5
    for ce in chennai_exp:
        assert ce["city"].lower() == "chennai"
    print(f"PASS: Chennai experiences ({len(chennai_exp)}) verified")

def test_services_api():
    # 1. Get all services
    res = client.get("/api/services")
    assert res.status_code == 200
    all_srv = res.json()
    assert len(all_srv) >= 8
    print(f"PASS: Total services: {len(all_srv)}")

    # 2. Search query: chef
    chef_srv = client.get("/api/services?search=chef").json()
    assert len(chef_srv) >= 1
    assert "chef" in chef_srv[0]["title"].lower()
    print(f"PASS: Chef service verified")

    # 3. Search query: massage
    massage_srv = client.get("/api/services?search=massage").json()
    assert len(massage_srv) >= 1
    assert "massage" in massage_srv[0]["title"].lower()
    print(f"PASS: Massage service verified")

    # 4. Search query: chauffeur
    chauffeur_srv = client.get("/api/services?search=chauffeur").json()
    assert len(chauffeur_srv) >= 1
    assert "chauffeur" in chauffeur_srv[0]["title"].lower()
    print(f"PASS: Chauffeur service verified")

def test_unified_search_api():
    # 1. Unified search for Dubai on 'all'
    dubai_res = client.get("/api/search?q=Dubai&tab=all").json()
    assert dubai_res["total_listings"] >= 2
    assert dubai_res["total_experiences"] >= 2
    print(f"PASS: Unified search 'Dubai': {dubai_res['total_listings']} stays, {dubai_res['total_experiences']} experiences")

    # 2. Unified search on 'experiences' tab
    safari_res = client.get("/api/search?q=safari&tab=experiences").json()
    assert safari_res["total_experiences"] >= 1
    assert safari_res["total_listings"] == 0
    print(f"PASS: Experiences tab search 'safari': {safari_res['total_experiences']} experiences, 0 stays")

    # 3. Unified search on 'services' tab
    massage_res = client.get("/api/search?q=massage&tab=services").json()
    assert massage_res["total_services"] >= 1
    assert massage_res["total_listings"] == 0
    print(f"PASS: Services tab search 'massage': {massage_res['total_services']} services, 0 stays")

if __name__ == "__main__":
    print("=== STARTING COMPLETE BACKEND TEST SUITE ===")
    test_health()
    test_city_search_precision()
    test_listing_filters()
    test_booking_flow_and_conflict_prevention()
    test_host_crud_operations()
    test_reviews_flow()
    test_wishlists_flow()
    test_experiences_api()
    test_services_api()
    test_unified_search_api()
    print("\n=== ALL 10 TEST SUITES PASSED FLAWLESSLY! ===")
