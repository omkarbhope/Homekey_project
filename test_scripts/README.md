# API test scripts

Three scripts to pull and test data from the MVP data sources.

## Setup

- **Census Geocoder** and **NCES Schools**: no setup; no API key.
- **RentCast**: copy `.env.example` to `.env` in the project root and set your key:
  ```bash
  cp .env.example .env
  # Edit .env and set RENTCAST_API_KEY=your_key
  ```
  Get a key at [RentCast API Dashboard](https://app.rentcast.io/app/api) (50 free calls/month).

## Run (use the `real` venv)

From the project root:

```bash
# Geocoding (no key)
real/bin/python test_scripts/test_census_geocoder.py

# Schools near a point (no key)
real/bin/python test_scripts/test_nces_schools.py

# Property by address (requires RENTCAST_API_KEY in .env)
real/bin/python test_scripts/test_rentcast_property.py
```

Or activate the venv first: `source real/bin/activate`, then `python test_scripts/...`.

## What each script does

| Script | API | Purpose |
|--------|-----|--------|
| `test_census_geocoder.py` | US Census Geocoder | Geocode one-line and structured addresses; optional census geography (tract, block). |
| `test_nces_schools.py` | NCES EDGE (ArcGIS REST) | Query public K-12 school locations by bounding box or point + distance. |
| `test_rentcast_property.py` | RentCast | Look up property records by address (needs API key in `.env`). |
