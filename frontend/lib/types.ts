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

export interface NearbyPlace {
  name: string;
  lat: number;
  lon: number;
  category: string;
  address?: string | null;
}

export interface NewsItem {
  title: string;
  url: string;
  source?: string | null;
  published_date?: string | null;
}

export interface PropertyProfileResponse {
  location: Location;
  map: MapData;
  schools: School[];
  property: Record<string, unknown> | null;
  property_message: string | null;
  listings?: unknown;
  images?: { url: string; placeholder?: boolean }[] | null;
  nearby_places?: NearbyPlace[];
  radius_km?: number | null;
  local_news?: NewsItem[] | null;
}
