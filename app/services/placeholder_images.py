"""Optional placeholder property image from Unsplash (generic, not the actual property)."""
from typing import Optional

import httpx

from app.config import UNSPLASH_ACCESS_KEY

BASE_URL = "https://api.unsplash.com/search/photos"
TIMEOUT = 10.0


async def get_placeholder_image(
    city: Optional[str] = None,
    property_type: Optional[str] = None,
) -> Optional[str]:
    """
    Return one generic image URL for UI placeholder. Not a photo of the actual property.
    Requires UNSPLASH_ACCESS_KEY. Returns None if key unset or no result.
    """
    if not UNSPLASH_ACCESS_KEY or not UNSPLASH_ACCESS_KEY.strip():
        return None

    query_parts = []
    if property_type and property_type.strip():
        query_parts.append(property_type.strip().lower())
    else:
        query_parts.append("residential")
    if city and city.strip():
        query_parts.append(city.strip())
    query = " ".join(query_parts) or "house"

    params = {
        "query": query,
        "client_id": UNSPLASH_ACCESS_KEY.strip(),
        "per_page": 1,
    }
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(BASE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return None

    results = data.get("results") or []
    if not results:
        return None
    urls = results[0].get("urls") or {}
    return urls.get("regular") or urls.get("small") or urls.get("full")
