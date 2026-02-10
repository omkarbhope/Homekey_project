# Real Estate Property Profile API

FastAPI backend that aggregates property-related data from multiple sources. Users send an address and receive a single response with **location**, **map data**, **nearby schools**, and **property info** (tax, owner, etc.) so the UI can show one comprehensive view without calling external APIs directly.

---

## What data the backend pulls

The API does not store data; it fetches and merges it on each request from these sources:

| Source | What it provides | API key |
|--------|-------------------|--------|
| **US Census Geocoder** | Converts an address to latitude/longitude and returns census geography (state, county, tract, block, congressional district, urban area, etc.). Used as the map center and to query schools. | None |
| **NCES EDGE (K–12 schools)** | Public school locations near the geocoded point. For each school: name, NCES ID, street, city, state, ZIP, lat/lon. Used for map pins and a schools list. | None |
| **RentCast** | Property record when available: formatted address, property type, tax assessments (by year), property taxes, owner info, coordinates, assessor ID. Not every address has data (e.g. many government buildings return no record). | Required (see [Setup](#setup)) |

**Not included in this version:** MLS-style “for sale” listings or listing images. The response reserves `listings` and `images` for future use.

---

## How it works

1. **Request** – The client calls `GET /api/property-profile?address=...` or `POST /api/property-profile` with `{"address": "..."}`.
2. **Geocode** – The backend calls the Census Geocoder. If the address cannot be geocoded, it returns `404`.
3. **Parallel fetch** – Using the returned lat/lon, it calls **NCES** (schools near the point) and **RentCast** (property by address) in parallel.
4. **Merge** – Results are combined into one JSON payload: `location`, `map` (center + school points), `schools`, and `property` (or `null` with `property_message` when RentCast has no data).
5. **Response** – The client gets a single `PropertyProfileResponse` with everything needed to render the address, map, school list, and property details.

```
Address → Census (geocode) → lat, lon, census geography
                ↓
        ┌───────┴───────┐
        ↓               ↓
   NCES (schools)   RentCast (property)
        ↓               ↓
        └───────┬───────┘
                ↓
        PropertyProfileResponse
```

---

## Setup

1. **Python** – Use Python 3.9+ and a virtual environment (e.g. `real`).

2. **Install dependencies** (from project root):
   ```bash
   real/bin/pip install -r requirements.txt
   ```
   Or with the venv activated: `pip install -r requirements.txt`.

3. **RentCast API key** – Create a key at [RentCast API Dashboard](https://app.rentcast.io/app/api) (free tier: 50 calls/month). Add it to a `.env` file in the project root:
   ```env
   RENTCAST_API_KEY=your_api_key_here
   ```
   Without this key, property data will always be `null`; geocoding and schools still work.

4. **Run the server**:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
   API: http://127.0.0.1:8000  
   Docs: http://127.0.0.1:8000/docs

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check. Returns `{"status": "ok"}`. No external API calls. |
| GET | `/api/property-profile?address=...` | **Main endpoint.** Returns full profile: location, map, schools, property (or null). |
| POST | `/api/property-profile` | Same as above; send `{"address": "123 Main St, City, ST ZIP"}` in the body. |
| GET | `/api/geocode?address=...` | Census only: lat, lon, matched address, census geography. |
| GET | `/api/schools?lat=...&lon=...&radius_km=...` | NCES only: list of schools near the point (default `radius_km=5`). |
| GET | `/api/property?address=...` | RentCast only: property record or 404 if no data. |

**Errors**

- **404** – Address could not be geocoded (`/api/property-profile`, `/api/geocode`) or no property data for that address (`/api/property`).

---

## Response shape (property profile)

`GET` or `POST` `/api/property-profile` returns:

```json
{
  "location": {
    "normalized_address": "4600 SILVER HILL RD, WASHINGTON, DC, 20233",
    "lat": 38.846,
    "lon": -76.927,
    "census_geography": { "States": [...], "Counties": [...], "Census Tracts": [...], ... }
  },
  "map": {
    "center": { "lat": 38.846, "lon": -76.927 },
    "schools": [
      { "name": "...", "lat": 38.87, "lon": -76.94, "street": "...", "city": "...", "state": "...", "zip": "..." }
    ]
  },
  "schools": [
    { "name": "...", "nces_id": "...", "street": "...", "city": "...", "state": "...", "zip": "...", "lat": ..., "lon": ... }
  ],
  "property": { ... } | null,
  "property_message": "No property data for this address." | null,
  "listings": null,
  "images": null
}
```

- **location** – Use for display and as map center.
- **map.center** – Map center (lat/lon).
- **map.schools** – School points for map pins (name, lat, lon, address fields).
- **schools** – Same schools for a list/detail view (includes `nces_id`).
- **property** – RentCast payload when available (address, type, taxAssessments, propertyTaxes, owner, etc.); otherwise `null` and **property_message** is set.
- **listings** / **images** – Reserved for future use.

---

## Project layout

```
Real-estate/
  app/
    main.py           # FastAPI app, CORS, router
    config.py         # Loads RENTCAST_API_KEY from .env
    schemas/
      profile.py      # Pydantic: PropertyProfileResponse, Location, School, etc.
    routers/
      property.py     # /api/property-profile, /api/geocode, /api/schools, /api/property
    services/
      geocode.py      # Census Geocoder
      schools.py      # NCES EDGE (schools near point)
      rentcast.py     # RentCast property by address
      aggregator.py   # Orchestrates geocode → schools + property → profile
  test_scripts/       # Standalone scripts to test Census, NCES, RentCast (see test_scripts/README.md)
  .env                # RENTCAST_API_KEY (not committed)
  requirements.txt
  README.md           # This file
```

---

## CORS

The API allows requests from `http://localhost:3000` and `http://127.0.0.1:3000` so a local frontend can call it. Adjust `allow_origins` in `app/main.py` for other origins.
