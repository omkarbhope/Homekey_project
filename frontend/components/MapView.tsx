"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { MapSchool, NearbyPlace } from "@/lib/types";

const LazyMap = dynamic(() => import("./MapViewInner"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full min-h-[320px] bg-slate-200 rounded-lg flex items-center justify-center text-slate-500"
      aria-hidden
    >
      Loading map…
    </div>
  ),
});

export type MapFocusPoint = { lat: number; lon: number; zoom: number };

type MapViewProps = {
  center: { lat: number; lon: number };
  schools: MapSchool[];
  nearbyPlaces?: NearbyPlace[];
  focusPoint?: MapFocusPoint | null;
};

export function MapView({ center, schools, nearbyPlaces, focusPoint }: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const position: [number, number] = useMemo(
    () => [center.lat, center.lon],
    [center.lat, center.lon]
  );

  return (
    <div className="absolute inset-0 w-full h-full min-h-0">
      {mounted && (
        <LazyMap
          position={position}
          schools={schools}
          nearbyPlaces={nearbyPlaces ?? []}
          focusPoint={focusPoint ?? undefined}
        />
      )}
    </div>
  );
}
