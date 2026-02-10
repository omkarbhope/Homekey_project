"""RentCast: property by address. Returns property dict or None on 404/error."""
from typing import Optional
from urllib.parse import quote

import httpx

from app.config import RENTCAST_API_KEY

BASE_URL = "https://api.rentcast.io/v1"
TIMEOUT = 15.0


async def get_property_by_address(address: str) -> Optional[dict]:
    """
    Fetch property record by address.
    Returns the first property dict if found, None if 404 or error.
    """
    if not RENTCAST_API_KEY:
        return None
    url = f"{BASE_URL}/properties?address={quote(address)}"
    headers = {"X-Api-Key": RENTCAST_API_KEY, "Accept": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            data = resp.json()
        if isinstance(data, list) and data:
            return data[0]
        if isinstance(data, dict) and data.get("id"):
            return data
        return None
    except (httpx.HTTPError, Exception):
        return None
