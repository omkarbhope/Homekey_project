"""Pydantic models for property profile API."""
from typing import Any, Optional

from pydantic import BaseModel, Field


class Location(BaseModel):
    """Geocoded location from Census."""
    normalized_address: str
    lat: float
    lon: float
    census_geography: Optional[dict[str, Any]] = None


class MapSchool(BaseModel):
    """School point for map pins."""
    name: str
    lat: float
    lon: float
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None


class MapData(BaseModel):
    """Data needed to render the map."""
    center: dict[str, float] = Field(..., description="lat, lon")
    schools: list[MapSchool] = Field(default_factory=list)


class School(BaseModel):
    """School for list view (can extend MapSchool)."""
    name: str
    nces_id: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class NearbyPlace(BaseModel):
    """POI from Overpass (food, gym, grocery, mall, etc.)."""
    name: str
    lat: float
    lon: float
    category: str
    address: Optional[str] = None


class NewsItem(BaseModel):
    """Local news item (area-based)."""
    title: str
    url: str
    source: Optional[str] = None
    published_date: Optional[str] = None


class PropertyProfileRequest(BaseModel):
    """Request body for POST /api/property-profile."""
    address: str
    radius_km: Optional[float] = Field(None, ge=0.5, le=10.0)


class PropertyProfileResponse(BaseModel):
    """Unified response for GET/POST /api/property-profile."""
    location: Location
    map: MapData
    schools: list[School] = Field(default_factory=list)
    property: Optional[dict[str, Any]] = None
    property_message: Optional[str] = None
    listings: Optional[Any] = None
    images: Optional[list[Any]] = None
    nearby_places: list[NearbyPlace] = Field(default_factory=list)
    radius_km: Optional[float] = None
    local_news: Optional[list[NewsItem]] = None
