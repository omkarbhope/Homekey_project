"""Build unified property profile from geocode, schools, RentCast, and optional POI/news/images."""
import asyncio
from typing import Optional

from app.schemas.profile import (
    PropertyProfileResponse,
    Location,
    MapData,
    MapSchool,
    School,
    NearbyPlace,
    NewsItem,
)
from app.services.geocode import geocode_address_with_geographies
from app.services.schools import get_schools_near_point
from app.services.rentcast import get_property_by_address
from app.services.nearby_poi import get_nearby_poi
from app.services.local_news import get_local_news
from app.services.placeholder_images import get_placeholder_image
from app.config import UNSPLASH_ACCESS_KEY


def _city_state_from_address(matched_address: str) -> tuple[Optional[str], Optional[str]]:
    """Parse 'City, STATE' from Census matched_address (e.g. '..., Mountain View, CA, 94043')."""
    parts = [p.strip() for p in (matched_address or "").split(",") if p.strip()]
    if len(parts) >= 3:
        return parts[-3], parts[-2]
    if len(parts) == 2:
        return parts[0], parts[1]
    if len(parts) == 1:
        return parts[0], None
    return None, None


async def build_property_profile(
    address: str,
    radius_km: float = 2.0,
) -> Optional[PropertyProfileResponse]:
    """
    Geocode address, then fetch schools, property, and nearby POI in parallel.
    Returns PropertyProfileResponse or None if address could not be geocoded.
    """
    address = (address or "").strip()
    if not address:
        return None

    geo = await geocode_address_with_geographies(address)
    if not geo:
        return None

    lat = geo["lat"]
    lon = geo["lon"]
    normalized_address = geo.get("matched_address") or address
    census_geography = geo.get("geographies")

    radius_km = max(0.5, min(10.0, radius_km))

    schools_task = get_schools_near_point(lon, lat, radius_km=5.0)
    property_task = get_property_by_address(address)
    poi_task = get_nearby_poi(lat, lon, radius_km=radius_km)
    city, state = _city_state_from_address(normalized_address)
    news_task = get_local_news(city=city, state=state)

    schools_list, property_data, poi_list, news_list = await asyncio.gather(
        schools_task, property_task, poi_task, news_task
    )

    map_schools = [
        MapSchool(
            name=s["name"],
            lat=s.get("lat") or 0,
            lon=s.get("lon") or 0,
            street=s.get("street"),
            city=s.get("city"),
            state=s.get("state"),
            zip=s.get("zip"),
        )
        for s in schools_list
    ]
    school_models = [
        School(
            name=s["name"],
            nces_id=s.get("nces_id"),
            street=s.get("street"),
            city=s.get("city"),
            state=s.get("state"),
            zip=s.get("zip"),
            lat=s.get("lat"),
            lon=s.get("lon"),
        )
        for s in schools_list
    ]

    nearby_place_models = [
        NearbyPlace(
            name=p["name"],
            lat=p["lat"],
            lon=p["lon"],
            category=p["category"],
            address=p.get("address"),
        )
        for p in poi_list
    ]

    images_out = None
    if property_data and UNSPLASH_ACCESS_KEY and UNSPLASH_ACCESS_KEY.strip():
        prop_type = None
        if isinstance(property_data, dict):
            prop_type = property_data.get("propertyType") or property_data.get("type")
        url = await get_placeholder_image(city=city, property_type=prop_type)
        if url:
            images_out = [{"url": url, "placeholder": True}]

    return PropertyProfileResponse(
        location=Location(
            normalized_address=normalized_address,
            lat=lat,
            lon=lon,
            census_geography=census_geography,
        ),
        map=MapData(center={"lat": lat, "lon": lon}, schools=map_schools),
        schools=school_models,
        property=property_data,
        property_message="No property data for this address." if property_data is None else None,
        listings=None,
        images=images_out,
        nearby_places=nearby_place_models,
        radius_km=radius_km,
        local_news=[NewsItem(**n) for n in news_list] if news_list else None,
    )
