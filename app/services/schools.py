"""NCES EDGE: schools near a point (lat/lon)."""
import json
from urllib.parse import quote

import httpx

MAPSERVER_BASE = "https://nces.ed.gov/opengis/rest/services/K12_School_Locations/EDGE_GEOCODE_PUBLICSCH_1920/MapServer/0"
OUT_FIELDS = "NAME,NCESSCH,STREET,CITY,STATE,ZIP,LAT,LON,LEAID"
TIMEOUT = 20.0


async def get_schools_near_point(lon: float, lat: float, radius_km: float = 5.0) -> list[dict]:
    """
    Return list of school dicts: name, lat, lon, street, city, state, zip, nces_id, lea_id.
    Uses bounding box for reliability.
    """
    delta = radius_km / 111.0  # rough degrees for km
    geometry = json.dumps({
        "xmin": lon - delta,
        "ymin": lat - delta,
        "xmax": lon + delta,
        "ymax": lat + delta,
    })
    url = (
        f"{MAPSERVER_BASE}/query?"
        f"where=1%3D1&geometry={quote(geometry)}"
        f"&geometryType=esriGeometryEnvelope&inSR=4326"
        f"&spatialRel=esriSpatialRelIntersects"
        f"&outFields={quote(OUT_FIELDS)}&returnGeometry=false&f=json"
    )
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()
    features = data.get("features") or []
    if data.get("error"):
        return []
    out = []
    for f in features:
        att = f.get("attributes") or {}
        out.append({
            "name": att.get("NAME") or "",
            "nces_id": att.get("NCESSCH"),
            "street": att.get("STREET"),
            "city": att.get("CITY"),
            "state": att.get("STATE"),
            "zip": att.get("ZIP"),
            "lat": att.get("LAT"),
            "lon": att.get("LON"),
            "lea_id": att.get("LEAID"),
        })
    return out
