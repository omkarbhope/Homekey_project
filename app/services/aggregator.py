"""Build unified property profile from geocode, schools, and RentCast."""
import asyncio
from typing import Optional

from app.schemas.profile import (
    PropertyProfileResponse,
    Location,
    MapData,
    MapSchool,
    School,
)
from app.services.geocode import geocode_address_with_geographies
from app.services.schools import get_schools_near_point
from app.services.rentcast import get_property_by_address


async def build_property_profile(address: str) -> Optional[PropertyProfileResponse]:
    """
    Geocode address, then fetch schools and property in parallel.
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

    schools_task = get_schools_near_point(lon, lat, radius_km=5.0)
    property_task = get_property_by_address(address)
    schools_list, property_data = await asyncio.gather(schools_task, property_task)

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
        images=None,
    )
