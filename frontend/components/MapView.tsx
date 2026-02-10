"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { MapSchool } from "@/lib/types";

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

type MapViewProps = {
  center: { lat: number; lon: number };
  schools: MapSchool[];
};

export function MapView({ center, schools }: MapViewProps) {
  const position: [number, number] = useMemo(
    () => [center.lat, center.lon],
    [center.lat, center.lon]
  );
  return (
    <div className="w-full h-full min-h-[320px]">
      <LazyMap position={position} schools={schools} />
    </div>
  );
}
