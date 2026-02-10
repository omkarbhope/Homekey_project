"use client";

import type { NearbyPlace } from "@/lib/types";

type NearbyPlacesCardProps = {
  places: NearbyPlace[];
  radiusKm?: number | null;
};

const categoryLabel: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  fast_food: "Fast food",
  gym: "Gym",
  supermarket: "Supermarket",
  mall: "Mall",
  convenience: "Convenience",
  place_of_worship: "Place of worship",
};

function labelFor(category: string): string {
  return categoryLabel[category] ?? category;
}

export function NearbyPlacesCard({ places, radiusKm }: NearbyPlacesCardProps) {
  if (!places?.length) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow transition-shadow hover:shadow-md">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
        Nearby places
        {radiusKm != null && (
          <span className="font-normal text-slate-400 ml-1">
            (within {radiusKm} km)
          </span>
        )}
      </h2>
      <ul className="space-y-2">
        {places.slice(0, 15).map((p, i) => (
          <li key={`${p.name}-${p.lat}-${p.lon}-${i}`} className="text-sm">
            <span className="font-medium text-slate-900">{p.name}</span>
            <span className="text-slate-500 ml-1.5">
              — {labelFor(p.category)}
            </span>
            {p.address && (
              <div className="text-slate-500 text-xs mt-0.5 truncate">
                {p.address}
              </div>
            )}
          </li>
        ))}
      </ul>
      {places.length > 15 && (
        <p className="text-xs text-slate-400 mt-2">
          +{places.length - 15} more
        </p>
      )}
    </section>
  );
}
