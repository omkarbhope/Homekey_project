"""
Test script for NCES EDGE ArcGIS REST API (K-12 school locations).
No API key required. Query public schools by point (lat/long) or bounding box.

Layer: Public School Locations 2019-20
Docs: https://nces.ed.gov/programs/edge/Geographic/SchoolLocations
API: https://nces.ed.gov/opengis/rest/services/K12_School_Locations/
"""

import json
import urllib.parse
import urllib.request

# Public school locations (2019-20). Layer 0 = first feature layer.
MAPSERVER_BASE = "https://nces.ed.gov/opengis/rest/services/K12_School_Locations/EDGE_GEOCODE_PUBLICSCH_1920/MapServer/0"


def query_schools_by_point(lon: float, lat: float, distance_meters: int = 5000, out_fields: str = "*") -> dict:
    """
    Query schools within distance of a point (WGS84).
    Uses ArcGIS REST: geometry + distance.
    """
    # ArcGIS: point + distance uses spatialRel and distance/units
    geometry = json.dumps({"x": lon, "y": lat})
    params = {
        "where": "1=1",
        "geometry": geometry,
        "geometryType": "esriGeometryPoint",
        "inSR": "4326",
        "spatialRel": "esriSpatialRelIntersects",
        "distance": distance_meters,
        "units": "esriSRUnit_Meter",
        "outFields": out_fields,
        "returnGeometry": "false",
        "f": "json",
    }
    # Geometry JSON must be passed as-is (quote but don't double-encode)
    url = f"{MAPSERVER_BASE}/query?where=1%3D1&geometry={urllib.parse.quote(geometry)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance={distance_meters}&units=esriSRUnit_Meter&outFields={urllib.parse.quote(out_fields)}&returnGeometry=false&f=json"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode())


def query_schools_bbox(lon_min: float, lat_min: float, lon_max: float, lat_max: float, out_fields: str = "*") -> dict:
    """
    Query schools within a bounding box (WGS84).
    More reliable than distance on some servers.
    """
    geometry = json.dumps({"xmin": lon_min, "ymin": lat_min, "xmax": lon_max, "ymax": lat_max})
    params = {
        "where": "1=1",
        "geometry": geometry,
        "geometryType": "esriGeometryEnvelope",
        "inSR": "4326",
        "spatialRel": "esriSpatialRelIntersects",
        "outFields": out_fields,
        "returnGeometry": "false",
        "f": "json",
    }
    url = f"{MAPSERVER_BASE}/query?where=1%3D1&geometry={urllib.parse.quote(geometry)}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields={urllib.parse.quote(out_fields)}&returnGeometry=false&f=json"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode())


def main():
    print("=== NCES EDGE Schools API test ===\n")

    # Use a point near Washington DC (e.g. from Census geocoder result: -76.927, 38.846)
    lon, lat = -76.927, 38.846
    radius_km = 3

    # 1) Query by bounding box (~3km around point)
    delta = 0.03  # ~3km in degrees
    print(f"1) Schools in bbox around ({lon}, {lat}), delta={delta}")
    result = query_schools_bbox(
        lon - delta, lat - delta, lon + delta, lat + delta,
        out_fields="NAME,NCESSCH,STREET,CITY,STATE,ZIP,LAT,LON,LEAID",
    )
    features = result.get("features") or []
    print(f"   Found {len(features)} schools")
    for f in features[:5]:
        att = f.get("attributes", {})
        print(f"   - {att.get('NAME')} | {att.get('CITY')}, {att.get('STATE')} {att.get('ZIP')}")
    if result.get("error"):
        print("   Error:", result.get("error"))
    print()

    # 2) Query by point + distance (5 km)
    print(f"2) Schools within {radius_km} km of point ({lon}, {lat})")
    result2 = query_schools_by_point(lon, lat, distance_meters=radius_km * 1000, out_fields="NAME,CITY,STATE,ZIP")
    features2 = result2.get("features") or []
    print(f"   Found {len(features2)} schools")
    for f in features2[:5]:
        att = f.get("attributes", {})
        print(f"   - {att.get('NAME')} | {att.get('CITY')}, {att.get('STATE')}")
    if result2.get("error"):
        print("   Error:", result2.get("error"))
    print("\nDone.")


if __name__ == "__main__":
    main()
