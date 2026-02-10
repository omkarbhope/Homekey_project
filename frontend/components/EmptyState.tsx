"use client";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-20 px-4">
      <p className="text-slate-600 text-center max-w-md text-base leading-relaxed">
        One place for location, schools, and property details. Enter a full
        address above to see the map, nearby schools, and property info.
      </p>
    </div>
  );
}
