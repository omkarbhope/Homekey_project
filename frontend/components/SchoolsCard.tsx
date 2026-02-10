import type { School } from "@/lib/types";

type SchoolsCardProps = {
  schools: School[];
  mapRef?: React.RefObject<HTMLDivElement | null>;
};

function formatAddress(s: School): string {
  return [s.street, [s.city, s.state].filter(Boolean).join(", "), s.zip]
    .filter(Boolean)
    .join(" ");
}

export function SchoolsCard({ schools, mapRef }: SchoolsCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow transition-shadow hover:shadow-md">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
        Nearby schools
      </h2>
      {schools.length === 0 ? (
        <p className="text-slate-600 text-sm">No schools found in this area.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-700">
              {schools.length} school{schools.length !== 1 ? "s" : ""}
            </span>
            {mapRef && (
              <button
                type="button"
                onClick={() => mapRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="text-primary-600 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:ring-offset-1 rounded"
              >
                See on map
              </button>
            )}
          </div>
          <ul className="space-y-3">
            {schools.map((s, i) => (
              <li key={s.nces_id ?? `${s.name}-${i}`} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="font-medium text-slate-900">{s.name}</div>
                {formatAddress(s) && (
                  <div className="text-sm text-slate-600 mt-0.5">
                    {formatAddress(s)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
