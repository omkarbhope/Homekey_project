"use client";

type PropertyCardProps = {
  property: Record<string, unknown> | null;
  propertyMessage: string | null;
  images?: { url: string; placeholder?: boolean }[] | null;
};

interface TaxYear {
  year?: number;
  value?: number;
  total?: number;
  improvements?: number;
}

export function PropertyCard({ property, propertyMessage, images }: PropertyCardProps) {
  if (property == null) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow transition-shadow hover:shadow-md">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Property details
        </h2>
        <p className="text-slate-600 italic text-base">
          {propertyMessage ?? "No property data for this address."}
        </p>
      </section>
    );
  }

  const address =
    (property.formattedAddress as string) ??
    [property.addressLine1, property.city, property.state, property.zipCode]
      .filter(Boolean)
      .join(", ");
  const propertyType = property.propertyType as string | undefined;
  const taxAssessments = property.taxAssessments as Record<string, TaxYear> | undefined;
  const propertyTaxes = property.propertyTaxes as Record<string, TaxYear> | undefined;
  const owner = property.owner as { names?: string[]; type?: string } | undefined;
  const ownerNames = owner?.names ?? [];

  const sortedTaxYears = taxAssessments
    ? Object.entries(taxAssessments).sort(([a], [b]) => Number(b) - Number(a))
    : [];
  const sortedPropertyTaxYears = propertyTaxes
    ? Object.entries(propertyTaxes).sort(([a], [b]) => Number(b) - Number(a))
    : [];
  const latestAssessment = sortedTaxYears[0]?.[1];
  const latestTax = sortedPropertyTaxYears[0]?.[1];

  const firstImage = images?.[0];

  return (
    <section className="rounded-lg border-l-4 border-l-primary-600 border border-slate-200 bg-white p-5 shadow transition-shadow hover:shadow-md">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
        Property details
      </h2>
      {firstImage?.url && (
        <div className="mb-3">
          <img
            src={firstImage.url}
            alt=""
            className="w-full h-40 object-cover rounded-lg border border-slate-200"
          />
          {firstImage.placeholder && (
            <p className="text-xs text-slate-400 mt-1">Generic image — not the actual property.</p>
          )}
        </div>
      )}
      {address && (
        <p className="text-base text-slate-900 font-medium mb-2">{address}</p>
      )}
      {propertyType && (
        <p className="text-sm text-slate-600 mb-3">Type: {propertyType}</p>
      )}

      {taxAssessments && sortedTaxYears.length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-semibold uppercase text-slate-400 mb-1">
            Tax assessments
          </h3>
          <ul className="text-sm text-slate-700 space-y-0.5">
            {sortedTaxYears.map(([year, data]) => (
              <li key={year}>
                {data?.year ?? year}:{" "}
                {data?.value != null ? (
                  <span className={data === latestAssessment ? "font-semibold text-slate-900" : ""}>
                    ${Number(data.value).toLocaleString()}
                  </span>
                ) : (
                  "—"
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {propertyTaxes && sortedPropertyTaxYears.length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-semibold uppercase text-slate-400 mb-1">
            Property taxes
          </h3>
          <ul className="text-sm text-slate-700 space-y-0.5">
            {sortedPropertyTaxYears.map(([year, data]) => (
              <li key={year}>
                {data?.year ?? year}:{" "}
                {data?.total != null ? (
                  <span className={data === latestTax ? "font-semibold text-slate-900" : ""}>
                    ${Number(data.total).toLocaleString()}
                  </span>
                ) : (
                  "—"
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ownerNames.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase text-slate-400 mb-1">
            Owner
          </h3>
          <p className="text-sm text-slate-700">
            {ownerNames.join(", ")}
            {owner?.type && (
              <span className="text-slate-500"> ({owner.type})</span>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
