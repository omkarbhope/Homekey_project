"use client";

import { useRef } from "react";
import type { PropertyProfileResponse } from "@/lib/types";
import { MapView } from "./MapView";
import { LocationCard } from "./LocationCard";
import { PropertyCard } from "./PropertyCard";
import { SchoolsCard } from "./SchoolsCard";

type ResultViewProps = {
  profile: PropertyProfileResponse;
};

export function ResultView({ profile }: ResultViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-12">
      <div ref={mapRef} className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Location and nearby schools
        </h2>
        <div
          className="h-[min(50vh,420px)] w-full rounded-lg overflow-hidden border border-slate-200 shadow"
          aria-label="Map"
        >
          <MapView
            center={profile.map.center}
            schools={profile.map.schools}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <PropertyCard
          property={profile.property}
          propertyMessage={profile.property_message}
        />
        <LocationCard location={profile.location} />
        <div className="md:col-span-2 lg:col-span-1">
          <SchoolsCard schools={profile.schools} mapRef={mapRef} />
        </div>
      </div>
    </div>
  );
}
