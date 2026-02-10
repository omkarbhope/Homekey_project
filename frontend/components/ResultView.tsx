"use client";

import { useState, useCallback } from "react";
import type { PropertyProfileResponse } from "@/lib/types";
import type { MapFocusPoint } from "./MapView";
import type { DetailItem } from "./DetailPanel";
import type { ResultTab } from "./ResultRightPanel";
import { MapView } from "./MapView";
import { ResultRightPanel } from "./ResultRightPanel";

const MAP_FOCUS_ZOOM = 17;

type ResultViewProps = {
  profile: PropertyProfileResponse;
};

export function ResultView({ profile }: ResultViewProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>("property");
  const [selectedDetail, setSelectedDetail] = useState<DetailItem | null>(null);
  const [mapFocus, setMapFocus] = useState<MapFocusPoint | null>(null);

  const handleMapFocus = useCallback((lat: number, lon: number) => {
    setMapFocus({ lat, lon, zoom: MAP_FOCUS_ZOOM });
  }, []);

  const handleBackDetail = useCallback(() => {
    setSelectedDetail(null);
  }, []);

  const handleTabChange = useCallback((tab: ResultTab) => {
    setActiveTab(tab);
    setSelectedDetail(null);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full overflow-hidden">
      <div className="h-[50vh] lg:h-full lg:w-1/2 min-w-0 min-h-0 relative border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-100 overflow-hidden">
        <div className="absolute inset-0">
          <MapView
            center={profile.map.center}
            schools={profile.map.schools}
            nearbyPlaces={profile.nearby_places}
            focusPoint={mapFocus}
          />
        </div>
      </div>
      <div className="flex-1 lg:w-1/2 min-w-0 flex flex-col min-h-0">
        <ResultRightPanel
          profile={profile}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          selectedDetail={selectedDetail}
          onSelectDetail={setSelectedDetail}
          onBackDetail={handleBackDetail}
          onMapFocus={handleMapFocus}
        />
      </div>
    </div>
  );
}
