"""Property profile and granular (geocode, schools, property) endpoints."""
from fastapi import APIRouter, HTTPException, Query

from app.schemas.profile import PropertyProfileRequest, PropertyProfileResponse
from app.services.aggregator import build_property_profile
from app.services.geocode import geocode_address_with_geographies
from app.services.schools import get_schools_near_point
from app.services.rentcast import get_property_by_address

router = APIRouter(prefix="/api", tags=["property"])


@router.get("/property-profile", response_model=PropertyProfileResponse)
async def get_property_profile(
    address: str = Query(..., min_length=1),
    radius_km: float = Query(2.0, ge=0.5, le=10.0),
):
    """Unified property profile: location, map data, schools, property, nearby POI."""
    profile = await build_property_profile(address, radius_km=radius_km)
    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Address could not be geocoded. Check the address and try again.",
        )
    return profile


@router.post("/property-profile", response_model=PropertyProfileResponse)
async def post_property_profile(body: PropertyProfileRequest):
    """Unified property profile (POST with body)."""
    radius = body.radius_km if body.radius_km is not None else 2.0
    profile = await build_property_profile(body.address, radius_km=radius)
    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Address could not be geocoded. Check the address and try again.",
        )
    return profile


@router.get("/geocode")
async def get_geocode(address: str = Query(..., min_length=1)):
    """Census geocode only: lat, lon, matched address, optional geographies."""
    result = await geocode_address_with_geographies(address)
    if result is None:
        raise HTTPException(status_code=404, detail="Address could not be geocoded.")
    return result


@router.get("/schools")
async def get_schools(
    lat: float = Query(...),
    lon: float = Query(...),
    radius_km: float = Query(5.0, ge=0.1, le=50.0),
):
    """NCES schools near a point (lat, lon)."""
    schools = await get_schools_near_point(lon, lat, radius_km=radius_km)
    return {"schools": schools}


@router.get("/property")
async def get_property(address: str = Query(..., min_length=1)):
    """RentCast property by address. 404 if no data."""
    prop = await get_property_by_address(address)
    if prop is None:
        raise HTTPException(
            status_code=404,
            detail="No property data for this address.",
        )
    return prop
