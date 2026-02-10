"use client";

import type { School, NearbyPlace, NewsItem } from "@/lib/types";

const PLACE_CATEGORY_LABEL: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  fast_food: "Fast food",
  gym: "Gym",
  supermarket: "Supermarket",
  mall: "Mall",
  convenience: "Convenience",
  place_of_worship: "Place of worship",
};

function placeCategoryLabel(category: string): string {
  return PLACE_CATEGORY_LABEL[category] ?? category;
}

function formatSchoolAddress(s: School): string {
  return [s.street, [s.city, s.state].filter(Boolean).join(", "), s.zip]
    .filter(Boolean)
    .join(" ");
}

export type DetailItem =
  | { type: "school"; item: School }
  | { type: "place"; item: NearbyPlace }
  | { type: "news"; item: NewsItem };

type DetailPanelProps = {
  detail: DetailItem;
  onBack: () => void;
  onShowOnMap?: (lat: number, lon: number) => void;
};

export function DetailPanel({ detail, onBack, onShowOnMap }: DetailPanelProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow">
      <div className="border-b border-slate-100 px-4 py-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-600/20 rounded"
        >
          ← Back
        </button>
      </div>
      <div className="p-4">
        {detail.type === "school" && (
          <SchoolDetail school={detail.item} onShowOnMap={onShowOnMap} />
        )}
        {detail.type === "place" && (
          <PlaceDetail place={detail.item} onShowOnMap={onShowOnMap} />
        )}
        {detail.type === "news" && <NewsDetail news={detail.item} />}
      </div>
    </div>
  );
}

function SchoolDetail({
  school,
  onShowOnMap,
}: {
  school: School;
  onShowOnMap?: (lat: number, lon: number) => void;
}) {
  const address = formatSchoolAddress(school);
  const hasCoords = school.lat != null && school.lon != null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">{school.name}</h3>
      {address && (
        <p className="text-sm text-slate-600">{address}</p>
      )}
      {school.nces_id && (
        <p className="text-xs text-slate-500">NCES ID: {school.nces_id}</p>
      )}
      {hasCoords && onShowOnMap && (
        <button
          type="button"
          onClick={() => onShowOnMap(school.lat!, school.lon!)}
          className="text-sm font-medium text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-600/20 rounded"
        >
          Show on map
        </button>
      )}
    </div>
  );
}

function PlaceDetail({
  place,
  onShowOnMap,
}: {
  place: NearbyPlace;
  onShowOnMap?: (lat: number, lon: number) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">{place.name}</h3>
      <p className="text-sm text-slate-600">
        {placeCategoryLabel(place.category)}
      </p>
      {place.address && (
        <p className="text-sm text-slate-500">{place.address}</p>
      )}
      {onShowOnMap && (
        <button
          type="button"
          onClick={() => onShowOnMap(place.lat, place.lon)}
          className="text-sm font-medium text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-600/20 rounded"
        >
          Show on map
        </button>
      )}
    </div>
  );
}

function NewsDetail({ news }: { news: NewsItem }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">{news.title}</h3>
      {news.source && (
        <p className="text-sm text-slate-500">{news.source}</p>
      )}
      {news.published_date && (
        <p className="text-xs text-slate-400">{news.published_date}</p>
      )}
      <a
        href={news.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm font-medium text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-600/20 rounded"
      >
        Read article →
      </a>
    </div>
  );
}
