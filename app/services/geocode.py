"""Census Geocoder: address to lat/long and optional census geography."""
from urllib.parse import urlencode

import httpx

BASE_URL = "https://geocoding.geo.census.gov/geocoder"
BENCHMARK = "Public_AR_Current"
VINTAGE = "Current_Current"
TIMEOUT = 15.0


async def geocode_address_with_geographies(address: str):
    """
    Geocode address and get census geography (one call: geographies/onelineaddress).
    Returns dict with: matched_address, lon, lat, geographies (optional).
    Returns None if no match.
    """
    path = f"{BASE_URL}/geographies/onelineaddress"
    params = {
        "address": address,
        "benchmark": BENCHMARK,
        "vintage": VINTAGE,
        "format": "json",
    }
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(f"{path}?{urlencode(params)}")
        resp.raise_for_status()
        data = resp.json()
    matches = data.get("result", {}).get("addressMatches") or []
    if not matches:
        return None
    match = matches[0]
    coords = match.get("coordinates", {})
    lon = coords.get("x")
    lat = coords.get("y")
    if lon is None or lat is None:
        return None
    return {
        "matched_address": match.get("matchedAddress", address),
        "lon": lon,
        "lat": lat,
        "geographies": match.get("geographies"),
    }
