"use client";

import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { MapSchool } from "@/lib/types";

const DEFAULT_ZOOM = 14;

function CenterController({
  position,
}: {
  position: [number, number];
}) {
  const map = useMap();
  useMemo(() => {
    map.setView(position, DEFAULT_ZOOM);
  }, [map, position[0], position[1]]);
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

type MapViewInnerProps = {
  position: [number, number];
  schools: MapSchool[];
};

export default function MapViewInner({ position, schools }: MapViewInnerProps) {
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

  return (
    <MapContainer
      center={position}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <CenterController position={position} />
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
    </MapContainer>
  );
}
