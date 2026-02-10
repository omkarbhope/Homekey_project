# Real Estate Property Profile

Full-stack app that turns scattered property information into one place: enter an address and get a **unified profile** with location, map, schools, property details, nearby places, and local news. Built to help buyers see a comprehensive picture before making property decisions.

- **Frontend**: Next.js 14 single-page app — address search, map (Leaflet), tabbed result (Property, Location, Schools, Nearby places, News).
- **Backend**: FastAPI — geocode then aggregate from Census, NCES, RentCast, Overpass, NewsCatcher, and optional Unsplash in one response.

---

## What the backend aggregates

The API does not store data; it fetches and merges on each request:

| Source | What it provides | API key |
|--------|-------------------|--------|
| **US Census Geocoder** | Address → lat/lon, normalized address, census geography (state, county, tract, etc.). Used as map center and for downstream queries. | None |
| **NCES EDGE (K–12)** | Schools near the point: name, NCES ID, address, lat/lon. Map pins + schools list. | None |
| **RentCast** | Property record when available: address, type, tax assessments, property taxes, owner. Not every address has data. | **Required** |
| **Overpass (OSM)** | Nearby POI: restaurants, cafes, grocery, gyms, malls, etc. within a configurable radius. | None |
| **NewsCatcher** | Local news for the area (city/state). | Optional |
| **Unsplash** | One placeholder property image when RentCast returns a property. | Optional |

Without **RENTCAST_API_KEY**, property data is always `null`; geocoding, schools, POI, and (if key set) news still work.

---

## How it works

1. **Request** — Client calls `GET /api/property-profile?address=...` (optional `&radius_km=2`).
2. **Geocode** — Backend uses Census. If the address cannot be geocoded, it returns 404.
3. **Parallel fetch** — Using lat/lon and address: NCES (schools), RentCast (property), Overpass (POI), NewsCatcher (local news). If property exists and Unsplash key is set, one placeholder image is fetched.
4. **Merge** — Results are combined into a single `PropertyProfileResponse`.
5. **Response** — One JSON payload: `location`, `map`, `schools`, `property` (or null + `property_message`), `nearby_places`, `local_news`, `images` (optional).

Architecture and data flow are documented in [docs/DESIGN.md](docs/DESIGN.md) with [diagrams](docs/diagrams/) (Mermaid → PNG).

---

## Quick start

### Backend (FastAPI)

1. **Python 3.9+** and a virtual environment, e.g. `python3 -m venv real && source real/bin/activate`.
2. **Install** (from project root):
   ```bash
   pip install -r requirements.txt
   ```
3. **Environment** — Create a `.env` in the project root:
   ```env
   RENTCAST_API_KEY=your_rentcast_key
   # Optional: for local news and placeholder image
   NEWSCATCHER_API_KEY=your_newscatcher_key
   UNSPLASH_ACCESS_KEY=your_unsplash_key
   ```
   Get a RentCast key at [RentCast API](https://app.rentcast.io/app/api) (free tier available).
4. **Run**:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
   - API: http://127.0.0.1:8000  
   - Docs: http://127.0.0.1:8000/docs  

### Frontend (Next.js)

1. **Node 18+**. From project root:
   ```bash
   cd frontend && npm install
   ```
2. **Environment** — Create `frontend/.env.local` (optional; defaults to backend on port 8000):
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```
3. **Run** (with backend already running):
   ```bash
   npm run dev
   ```
   App: http://localhost:3000  

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check. Returns `{"status": "ok"}`. |
| GET | `/api/property-profile?address=...` | **Main endpoint.** Full profile. Optional: `radius_km` (0.5–10, default 2). |
| POST | `/api/property-profile` | Same; body `{"address": "...", "radius_km": 2}`. |
| GET | `/api/geocode?address=...` | Census only: lat, lon, matched address, census geography. |
| GET | `/api/schools?lat=...&lon=...&radius_km=...` | NCES only: schools near point (default `radius_km=5`). |
| GET | `/api/property?address=...` | RentCast only: property record or 404. |

**Errors:** 404 when address cannot be geocoded (property-profile, geocode) or no property for that address (/api/property).

---

## Response shape (property profile)

`GET` or `POST` `/api/property-profile` returns:

```json
{
  "location": {
    "normalized_address": "123 MAIN ST, CITY, ST 12345",
    "lat": 38.9,
    "lon": -77.0,
    "census_geography": { "States": [...], "Counties": [...], "Census Tracts": [...], ... }
  },
  "map": {
    "center": { "lat": 38.9, "lon": -77.0 },
    "schools": [{ "name": "...", "lat": ..., "lon": ..., "street": "...", "city": "...", "state": "...", "zip": "..." }]
  },
  "schools": [{ "name": "...", "nces_id": "...", "street": "...", "city": "...", "state": "...", "zip": "...", "lat": ..., "lon": ... }],
  "property": { ... } | null,
  "property_message": "No property data for this address." | null,
  "listings": null,
  "images": [{ "url": "...", "placeholder": true }] | null,
  "nearby_places": [{ "name": "...", "lat": ..., "lon": ..., "category": "...", "address": "..." }],
  "radius_km": 2,
  "local_news": [{ "title": "...", "url": "...", "source": "...", "published_date": "..." }] | null
}
```

- **location** / **map** — Display and map center; **map.schools** for school pins.
- **schools** — Same schools for list/detail (includes **nces_id**).
- **property** — RentCast payload when available; otherwise **null** and **property_message** set.
- **nearby_places** — POI from Overpass within **radius_km**.
- **local_news** — Present when NewsCatcher key is set.
- **images** — One Unsplash placeholder URL when property exists and Unsplash key is set.
- **listings** — Reserved for future use.

---

## Project layout

```
Real-estate/
  app/                    # Backend (FastAPI)
    main.py               # App, CORS, routers
    config.py             # .env: RENTCAST_API_KEY, NEWSCATCHER_API_KEY, UNSPLASH_ACCESS_KEY
    schemas/profile.py    # PropertyProfileResponse, Location, School, NearbyPlace, NewsItem, ...
    routers/property.py   # /api/property-profile, /api/geocode, /api/schools, /api/property
    services/
      aggregator.py       # Geocode → parallel fetch → single profile
      geocode.py          # Census Geocoder
      schools.py         # NCES EDGE
      rentcast.py        # RentCast property
      nearby_poi.py      # Overpass POI
      local_news.py      # NewsCatcher
      placeholder_images.py  # Unsplash
  frontend/               # Next.js 14
    app/page.tsx         # Home: search → result / loading / error
    components/         # AddressSearch, ResultView, MapView, ResultRightPanel (tabs), ...
    lib/api.ts           # fetchPropertyProfile(address, radiusKm?)
    lib/types.ts         # Types aligned with backend schema
  docs/
    DESIGN.md            # Architecture, data flow, frontend structure
    diagrams/            # Mermaid sources (.mmd) and rendered PNGs
  test_scripts/          # Standalone scripts for Census, NCES, RentCast (see test_scripts/README.md)
  .env                   # API keys (not committed)
  requirements.txt
  README.md
```

---

## CORS

The API allows `http://localhost:3000` and `http://127.0.0.1:3000`. Change `allow_origins` in `app/main.py` for other origins.
