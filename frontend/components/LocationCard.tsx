import type { Location } from "@/lib/types";

type LocationCardProps = {
  location: Location;
};

function getAreaLine(location: Location): string | null {
  const g = location.census_geography;
  if (!g) return null;
  const counties = g["Counties"] as { NAME?: string }[] | undefined;
  const tracts = g["Census Tracts"] as { NAME?: string }[] | undefined;
  const parts: string[] = [];
  if (counties?.[0]?.NAME) parts.push(counties[0].NAME);
  if (tracts?.[0]?.NAME) parts.push(tracts[0].NAME);
  return parts.length ? parts.join(", ") : null;
}

export function LocationCard({ location }: LocationCardProps) {
  const area = getAreaLine(location);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow transition-shadow hover:shadow-md">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
        Location
      </h2>
      <p className="text-lg text-slate-900 font-medium leading-snug">
        {location.normalized_address}
      </p>
      {area && (
        <>
          <div className="my-3 border-t border-slate-100" />
          <p className="text-sm text-slate-500">{area}</p>
        </>
      )}
    </section>
  );
}
