"""
Test script for RentCast Property Data API.
Requires RENTCAST_API_KEY in .env (get key from https://app.rentcast.io/app/api).
Free tier: 50 API calls/month.

Docs: https://developers.rentcast.io/
Property Records: GET https://api.rentcast.io/v1/properties
"""

import json
import os
import urllib.parse
import urllib.request

# Load from .env if present (no extra deps: read file)
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.isfile(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_env()
API_KEY = os.environ.get("RENTCAST_API_KEY")
BASE_URL = "https://api.rentcast.io/v1"


def get_properties_by_address(address: str) -> dict:
    """Search property records by full address."""
    url = f"{BASE_URL}/properties?address={urllib.parse.quote(address)}"
    req = urllib.request.Request(url)
    req.add_header("X-Api-Key", API_KEY)
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def get_property_by_id(property_id: str) -> dict:
    """Get a single property record by ID."""
    url = f"{BASE_URL}/properties/{urllib.parse.quote(property_id)}"
    req = urllib.request.Request(url)
    req.add_header("X-Api-Key", API_KEY)
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def main():
    print("=== RentCast Property API test ===\n")

    if not API_KEY:
        print("Missing RENTCAST_API_KEY. Add it to .env in the project root:")
        print("  RENTCAST_API_KEY=your_api_key_here")
        print("\nGet a key at: https://app.rentcast.io/app/api")
        return

    # Use an address RentCast has data for (many residential/gov't addresses return 404)
    test_addresses = [
        "1600 Amphitheatre Pkwy, Mountain View, CA 94043",
        "5618 Stevens Creek Blvd, Cupertino, CA 95014",  # fallback; often 404
    ]
    for test_address in test_addresses:
        print(f"Property search: {test_address}")
        try:
            result = get_properties_by_address(test_address)
            if isinstance(result, list) and result:
                print(f"   Found {len(result)} record(s). First:")
                print(json.dumps(result[0], indent=2)[:1500])
                break
            elif isinstance(result, dict) and result.get("id"):
                print(json.dumps(result, indent=2)[:1500])
                break
            else:
                print("   Response:", json.dumps(result, indent=2)[:500])
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            if e.code == 404:
                print(f"   404 - No data for this address in RentCast (try another).")
            else:
                print(f"   HTTP {e.code}: {body[:500]}")
        except Exception as e:
            print(f"   Error: {e}")
    print("\nDone.")


if __name__ == "__main__":
    main()
