import type { PropertyProfileResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function fetchPropertyProfile(
  address: string
): Promise<PropertyProfileResponse> {
  const url = `${API_BASE}/api/property-profile?${new URLSearchParams({
    address: address.trim(),
  }).toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("ADDRESS_NOT_FOUND");
    }
    throw new Error("FETCH_FAILED");
  }
  return res.json() as Promise<PropertyProfileResponse>;
}
