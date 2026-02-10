"use client";

import { useState, useCallback } from "react";
import type { PropertyProfileResponse } from "@/lib/types";
import { AddressSearch } from "@/components/AddressSearch";
import { ErrorState } from "@/components/ErrorState";
import { ResultView } from "@/components/ResultView";
import { ResultSkeleton } from "@/components/ResultSkeleton";

type ViewState = "empty" | "loading" | "error" | "result";

export default function Home() {
  const [profile, setProfile] = useState<PropertyProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<"ADDRESS_NOT_FOUND" | "FETCH_FAILED" | null>(null);

  const viewState: ViewState = loading
    ? "loading"
    : error
      ? "error"
      : profile
        ? "result"
        : "empty";

  const handleResult = useCallback((p: PropertyProfileResponse) => {
    setProfile(p);
    setError(null);
  }, []);

  const handleError = useCallback((e: "ADDRESS_NOT_FOUND" | "FETCH_FAILED") => {
    setError(e);
    setProfile(null);
  }, []);

  const searchBar = (
    <AddressSearch
      onResult={handleResult}
      onError={handleError}
      onLoading={setLoading}
      disabled={loading}
      variant="default"
    />
  );

  const searchBarCompact = (
    <AddressSearch
      onResult={handleResult}
      onError={handleError}
      onLoading={setLoading}
      disabled={loading}
      variant="compact"
      defaultValue={profile?.location?.normalized_address ?? ""}
    />
  );

  if (viewState === "result" && profile) {
    return (
      <main className="h-screen flex flex-col bg-slate-50 overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-medium text-slate-500 shrink-0">
              Property Profile
            </span>
            <div className="flex-1 w-full min-w-0">{searchBarCompact}</div>
          </div>
        </header>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <ResultView profile={profile} />
        </div>
      </main>
    );
  }

  if (viewState === "loading") {
    return (
      <main className="h-screen flex flex-col bg-slate-50 overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-medium text-slate-500 shrink-0">
              Property Profile
            </span>
            <div className="flex-1 w-full min-w-0">{searchBarCompact}</div>
          </div>
        </header>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <ResultSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen">
        {viewState === "empty" && (
          <>
            <h1 className="text-2xl md:text-4xl font-semibold text-slate-900 mb-2 text-center">
              Property Profile
            </h1>
            <p className="text-slate-600 text-center max-w-md mb-10 text-base">
              One place for location, schools, and property details.
            </p>
            {searchBar}
          </>
        )}
        {viewState === "error" && (
          <ErrorState
            message={
              error === "ADDRESS_NOT_FOUND"
                ? "We couldn't find that address. Try another."
                : "Something went wrong. Please try again."
            }
          >
            <div className="mt-6 w-full max-w-2xl">{searchBar}</div>
          </ErrorState>
        )}
      </div>
    </main>
  );
}
