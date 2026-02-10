"""Nearby POI (food, gym, grocery, malls) via Overpass API (OpenStreetMap). No API key."""
import json
import logging
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
TIMEOUT = 45.0  # Overpass can be slow; 504s are common under load
MAX_RADIUS_M = 10_000  # 10 km
DEFAULT_RADIUS_M = 2_000  # 2 km


def _build_query(lat: float, lon: float, radius_m: int) -> str:
    # Query nodes and ways for amenity and shop tags (Overpass: tag filter then (around:radius,lat,lon))
    return f"""[out:json][timeout:40];
(
  node["amenity"~"^(restaurant|cafe|fast_food|gym)$"](around:{radius_m},{lat},{lon});
  way["amenity"~"^(restaurant|cafe|fast_food|gym)$"](around:{radius_m},{lat},{lon});
  node["shop"~"^(supermarket|mall|convenience)$"](around:{radius_m},{lat},{lon});
  way["shop"~"^(supermarket|mall|convenience)$"](around:{radius_m},{lat},{lon});
);
out center;"""


def _element_to_place(el: dict) -> Optional[dict]:
    tags = el.get("tags") or {}
    name = tags.get("name") or tags.get("brand") or "Unnamed"
    lat = el.get("lat")
    lon = el.get("lon")
    if lat is None or lon is None:
        center = el.get("center")
        if center:
            lat = center.get("lat")
            lon = center.get("lon")
    if lat is None or lon is None:
        return None
    category = tags.get("amenity") or tags.get("shop") or "place"
    # Build address from tags if present
    address_parts = [
        tags.get("addr:street"),
        tags.get("addr:housenumber"),
        tags.get("addr:city"),
        tags.get("addr:state"),
        tags.get("addr:postcode"),
    ]
    address = " ".join(str(p) for p in address_parts if p) or None
    return {
        "name": name,
        "lat": lat,
        "lon": lon,
        "category": category,
        "address": address,
    }


async def get_nearby_poi(
    lat: float,
    lon: float,
    radius_km: float = 2.0,
) -> list[dict[str, Any]]:
    """
    Fetch nearby POI (restaurants, cafes, gyms, supermarkets, malls) from OpenStreetMap.
    Returns list of {name, lat, lon, category, address?}.
    """
    radius_m = min(max(int(radius_km * 1000), 500), MAX_RADIUS_M)
    query = _build_query(lat, lon, radius_m)
    last_error = None
    for attempt in range(2):  # initial + one retry
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                resp = await client.post(
                    OVERPASS_URL,
                    content=query,
                    headers={"Content-Type": "text/plain"},
                )
                resp.raise_for_status()
                data = resp.json()
                break
        except (httpx.HTTPError, json.JSONDecodeError) as e:
            last_error = e
            resp = getattr(e, "response", None)
            status = getattr(resp, "status_code", None) if resp is not None else None
            retryable = status in (502, 503, 504) or isinstance(e, httpx.TimeoutException)
            if retryable and attempt == 0:
                logger.info("Nearby POI attempt 1 failed (will retry): %s", e)
                continue
            logger.warning("Nearby POI fetch failed for %.4f,%.4f: %s", lat, lon, last_error)
            return []
    elements = data.get("elements") or []
    seen = set()
    out = []
    for el in elements:
        place = _element_to_place(el)
        if not place:
            continue
        key = (place["lat"], place["lon"], place["name"])
        if key in seen:
            continue
        seen.add(key)
        out.append(place)
    return out[:100]  # cap for response size
