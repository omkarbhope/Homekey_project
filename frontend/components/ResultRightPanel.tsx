"use client";

import type { PropertyProfileResponse, School, NearbyPlace, NewsItem } from "@/lib/types";
import { PropertyCard } from "./PropertyCard";
import { LocationCard } from "./LocationCard";
import { DetailPanel, type DetailItem } from "./DetailPanel";

const PLACE_CATEGORY_LABEL: Record<string, string> = {
  restaurant: "Restaurants",
  cafe: "Cafes",
  fast_food: "Fast food",
  gym: "Gyms",
  supermarket: "Grocery & supermarkets",
  mall: "Malls",
  convenience: "Convenience",
  place_of_worship: "Places of worship",
};

const PLACE_CATEGORY_ORDER = [
  "restaurant",
  "cafe",
  "fast_food",
  "supermarket",
  "convenience",
  "mall",
  "gym",
  "place_of_worship",
];

function placeCategoryLabel(category: string): string {
  return PLACE_CATEGORY_LABEL[category] ?? category;
}

function groupPlacesByCategory(places: NearbyPlace[]): { category: string; label: string; items: NearbyPlace[] }[] {
  const byCategory = new Map<string, NearbyPlace[]>();
  for (const p of places) {
    const cat = p.category?.toLowerCase() || "place";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(p);
  }
  const orderSet = new Set(PLACE_CATEGORY_ORDER);
  const out: { category: string; label: string; items: NearbyPlace[] }[] = [];
  for (const category of PLACE_CATEGORY_ORDER) {
    const items = byCategory.get(category);
    if (items?.length) {
      out.push({ category, label: placeCategoryLabel(category), items });
    }
  }
  Array.from(byCategory.entries()).forEach(([category, items]) => {
    if (!orderSet.has(category)) {
      out.push({ category, label: placeCategoryLabel(category), items });
    }
  });
  return out;
}

export type ResultTab = "property" | "location" | "schools" | "places" | "news";

type ResultRightPanelProps = {
  profile: PropertyProfileResponse;
  activeTab: ResultTab;
  onTabChange: (tab: ResultTab) => void;
  selectedDetail: DetailItem | null;
  onSelectDetail: (detail: DetailItem) => void;
  onBackDetail: () => void;
  onMapFocus: (lat: number, lon: number) => void;
};

const TABS: { id: ResultTab; label: string }[] = [
  { id: "property", label: "Property" },
  { id: "location", label: "Location" },
  { id: "schools", label: "Schools" },
  { id: "places", label: "Nearby places" },
  { id: "news", label: "News" },
];

export function ResultRightPanel({
  profile,
  activeTab,
  onTabChange,
  selectedDetail,
  onSelectDetail,
  onBackDetail,
  onMapFocus,
}: ResultRightPanelProps) {
  const tabs = TABS;

  const showDetail = selectedDetail != null;
  const detailMatchesTab =
    (activeTab === "schools" && selectedDetail?.type === "school") ||
    (activeTab === "places" && selectedDetail?.type === "place") ||
    (activeTab === "news" && selectedDetail?.type === "news");

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50">
      <div
        role="tablist"
        className="flex border-b border-slate-200 bg-white shrink-0 overflow-x-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:ring-offset-1 -mb-px ${
              activeTab === tab.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {showDetail && detailMatchesTab ? (
          <DetailPanel
            detail={selectedDetail}
            onBack={onBackDetail}
            onShowOnMap={
              selectedDetail.type !== "news" ? onMapFocus : undefined
            }
          />
        ) : (
          <>
            {activeTab === "property" && (
              <PropertyCard
                property={profile.property}
                propertyMessage={profile.property_message}
                images={profile.images}
              />
            )}
            {activeTab === "location" && (
              <LocationCard location={profile.location} />
            )}
            {activeTab === "schools" && (
              <SchoolsList
                schools={profile.schools}
                onSelect={(s) => {
                  onSelectDetail({ type: "school", item: s });
                  if (s.lat != null && s.lon != null) {
                    onMapFocus(s.lat, s.lon);
                  }
                }}
              />
            )}
            {activeTab === "places" && (
              <PlacesList
                places={profile.nearby_places ?? []}
                radiusKm={profile.radius_km}
                onSelect={(p) => {
                  onSelectDetail({ type: "place", item: p });
                  onMapFocus(p.lat, p.lon);
                }}
              />
            )}
            {activeTab === "news" && (
              <NewsList
                items={profile.local_news ?? []}
                onSelect={(n) => onSelectDetail({ type: "news", item: n })}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SchoolsList({
  schools,
  onSelect,
}: {
  schools: School[];
  onSelect: (school: School) => void;
}) {
  if (schools.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow">
        <p className="text-slate-600 text-sm">No schools found in this area.</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow overflow-hidden">
      <ul className="divide-y divide-slate-100">
        {schools.map((s, i) => (
          <li key={s.nces_id ?? `${s.name}-${i}`}>
            <button
              type="button"
              onClick={() => onSelect(s)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:ring-inset transition-colors"
            >
              <div className="font-medium text-slate-900">{s.name}</div>
              {(s.street || s.city) && (
                <div className="text-sm text-slate-600 mt-0.5">
                  {[s.street, [s.city, s.state].filter(Boolean).join(", "), s.zip]
                    .filter(Boolean)
                    .join(" ")}
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlacesList({
  places,
  radiusKm,
  onSelect,
}: {
  places: NearbyPlace[];
  radiusKm?: number | null;
  onSelect: (place: NearbyPlace) => void;
}) {
  if (places.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow">
        <p className="text-slate-600 text-sm">No nearby places in this radius.</p>
      </div>
    );
  }
  const sections = groupPlacesByCategory(places);
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow overflow-hidden">
      {radiusKm != null && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
          Within {radiusKm} km
        </div>
      )}
      <div className="divide-y divide-slate-200">
        {sections.map(({ category, label, items }) => (
          <section key={category} className="border-b border-slate-100 last:border-b-0">
            <h3 className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 border-b border-slate-100">
              {label}
            </h3>
            <ul className="divide-y divide-slate-100">
              {items.map((p, i) => (
                <li key={`${p.name}-${p.lat}-${p.lon}-${i}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(p)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:ring-inset transition-colors"
                  >
                    <div className="font-medium text-slate-900">{p.name}</div>
                    {p.address && (
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        {p.address}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function NewsList({
  items,
  onSelect,
}: {
  items: NewsItem[];
  onSelect: (news: NewsItem) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow">
        <p className="text-slate-600 text-sm">No local news available.</p>
        <p className="text-slate-400 text-xs mt-2">
          Local news uses the NewsCatcher Local News API. If you expect results, ensure the backend has a valid NEWSCATCHER_API_KEY for the Local News API and check server logs for errors.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow overflow-hidden">
      <ul className="divide-y divide-slate-100">
        {items.map((n, i) => (
          <li key={`${n.url}-${i}`}>
            <button
              type="button"
              onClick={() => onSelect(n)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:ring-inset transition-colors"
            >
              <div className="font-medium text-slate-900">{n.title}</div>
              {n.source && (
                <div className="text-sm text-slate-500 mt-0.5">{n.source}</div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
