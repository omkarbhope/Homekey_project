"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { MapSchool, NearbyPlace } from "@/lib/types";

const DEFAULT_ZOOM = 14;
const MAX_POI_MARKERS = 25;

function CenterController({
  position,
}: {
  position: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, DEFAULT_ZOOM);
  }, [map, position[0], position[1]]);
  return null;
}

function FocusController({
  focusPoint,
}: {
  focusPoint?: { lat: number; lon: number; zoom: number };
}) {
  const map = useMap();
  useEffect(() => {
    if (!focusPoint) return;
    map.flyTo([focusPoint.lat, focusPoint.lon], focusPoint.zoom, { duration: 0.5 });
  }, [map, focusPoint?.lat, focusPoint?.lon, focusPoint?.zoom]);
  return null;
}

const propertyIcon = new L.DivIcon({
  className: "property-marker",
  html: `<div style="width:24px;height:24px;background:#2563eb;border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const schoolIcon = new L.DivIcon({
  className: "school-marker",
  html: `<div style="width:20px;height:20px;background:#0ea5e9;border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const poiIcon = new L.DivIcon({
  className: "poi-marker",
  html: `<div style="width:14px;height:14px;background:#64748b;border:2px solid white;border-radius:50%;box-shadow:0 1px 2px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

type MapViewInnerProps = {
  position: [number, number];
  schools: MapSchool[];
  nearbyPlaces: NearbyPlace[];
  focusPoint?: { lat: number; lon: number; zoom: number };
};

export default function MapViewInner({ position, schools, nearbyPlaces, focusPoint }: MapViewInnerProps) {
  const schoolMarkers = useMemo(
    () =>
      schools
        .filter((s) => s.lat != null && s.lon != null)
        .map((s) => ({
          ...s,
          pos: [s.lat!, s.lon!] as [number, number],
        })),
    [schools]
  );

  const poiMarkers = useMemo(
    () =>
      nearbyPlaces
        .slice(0, MAX_POI_MARKERS)
        .map((p) => ({ ...p, pos: [p.lat, p.lon] as [number, number] })),
    [nearbyPlaces]
  );

  return (
    <MapContainer
      center={position}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <CenterController position={position} />
      <FocusController focusPoint={focusPoint} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={propertyIcon}>
        <Popup>Property address</Popup>
      </Marker>
      {schoolMarkers.map((s, i) => (
        <Marker key={`${s.name}-${s.lat}-${s.lon}-${i}`} position={s.pos} icon={schoolIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-medium">{s.name}</div>
              {(s.street || s.city) && (
                <div className="text-slate-600 mt-1">
                  {[s.street, [s.city, s.state].filter(Boolean).join(", "), s.zip]
                    .filter(Boolean)
                    .join(" ")}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      {poiMarkers.map((p, i) => (
        <Marker key={`poi-${p.name}-${p.lat}-${p.lon}-${i}`} position={p.pos} icon={poiIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-medium">{p.name}</div>
              <div className="text-slate-500">{p.category}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
