"""
Test script for US Census Bureau Geocoder API.
No API key required. Geocodes US addresses to lat/long (and optional census geography).

Docs: https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html
"""

import json
import urllib.parse
import urllib.request

BASE_URL = "https://geocoding.geo.census.gov/geocoder"
BENCHMARK = "Public_AR_Current"  # or use benchmark id "4"


def geocode_oneline(address: str, format: str = "json") -> dict:
    """Geocode a single-line address. Returns locations (lat/long) only."""
    path = f"{BASE_URL}/locations/onelineaddress"
    params = {
        "address": address,
        "benchmark": BENCHMARK,
        "format": format,
    }
    url = f"{path}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode())


def geocode_address(street: str, city: str = "", state: str = "", zipcode: str = "", format: str = "json") -> dict:
    """Geocode using street, city, state, zip. Minimum: street + (zip OR city+state)."""
    path = f"{BASE_URL}/locations/address"
    params = {
        "street": street,
        "city": city,
        "state": state,
        "zip": zipcode,
        "benchmark": BENCHMARK,
        "format": format,
    }
    params = {k: v for k, v in params.items() if v}
    url = f"{path}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode())


def geocode_with_geographies(street: str, city: str, state: str, zipcode: str = "", format: str = "json") -> dict:
    """Geocode and get census geography (tract, block, etc.) for the point."""
    path = f"{BASE_URL}/geographies/address"
    params = {
        "street": street,
        "city": city,
        "state": state,
        "zip": zipcode,
        "benchmark": BENCHMARK,
        "vintage": "Current_Current",
        "format": format,
    }
    params = {k: v for k, v in params.items() if v}
    url = f"{path}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode())


def main():
    print("=== Census Geocoder API test ===\n")

    # 1) Single-line address
    print("1) Geocode (oneline): 4600 Silver Hill Rd, Washington, DC 20233")
    result = geocode_oneline("4600 Silver Hill Rd, Washington, DC 20233")
    if result.get("result", {}).get("addressMatches"):
        match = result["result"]["addressMatches"][0]
        coords = match.get("coordinates", {})
        print(f"   Matched: {match.get('matchedAddress')}")
        print(f"   Coordinates: x={coords.get('x')}, y={coords.get('y')} (lon, lat)")
    else:
        print("   No matches:", json.dumps(result, indent=2)[:500])
    print()

    # 2) Structured address
    print("2) Geocode (structured): street + city + state")
    result2 = geocode_address(
        street="4600 Silver Hill Rd",
        city="Washington",
        state="DC",
    )
    if result2.get("result", {}).get("addressMatches"):
        match = result2["result"]["addressMatches"][0]
        print(f"   Matched: {match.get('matchedAddress')}")
        print(f"   Coordinates: {match.get('coordinates')}")
    else:
        print("   No matches")
    print()

    # 3) With census geographies (tract, block, etc.)
    print("3) Geocode + census geographies (tract, block)")
    result3 = geocode_with_geographies(
        street="4600 Silver Hill Rd",
        city="Washington",
        state="DC",
        zipcode="20233",
    )
    if result3.get("result", {}).get("addressMatches"):
        match = result3["result"]["addressMatches"][0]
        geos = match.get("geographies", {})
        print(f"   Matched: {match.get('matchedAddress')}")
        for layer, features in (geos or {}).items():
            if features:
                print(f"   {layer}: {features[0].get('GEOID')} - {features[0].get('NAME')}")
    else:
        print("   No matches or geographies")
    print("\nDone.")


if __name__ == "__main__":
    main()
