/** Mirrors backend PropertyProfileResponse and nested shapes */
export interface Location {
  normalized_address: string;
  lat: number;
  lon: number;
  census_geography?: Record<string, unknown[]>;
}

export interface MapSchool {
  name: string;
  lat: number;
  lon: number;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

export interface MapData {
  center: { lat: number; lon: number };
  schools: MapSchool[];
}

export interface School {
  name: string;
  nces_id?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  lat?: number | null;
  lon?: number | null;
}

export interface PropertyProfileResponse {
  location: Location;
  map: MapData;
  schools: School[];
  property: Record<string, unknown> | null;
  property_message: string | null;
  listings?: unknown;
  images?: unknown[] | null;
}
