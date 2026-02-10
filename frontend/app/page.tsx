"use client";

import { useState, useCallback } from "react";
import type { PropertyProfileResponse } from "@/lib/types";
import { AddressSearch } from "@/components/AddressSearch";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { ResultView } from "@/components/ResultView";

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
    />
  );

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
            Property Profile
          </h1>
          <p className="text-slate-600 text-base mb-6">
            One place for location, schools, and property details.
          </p>
          {searchBar}
        </div>
      </header>

      <div className="flex-1">
        {viewState === "empty" && <EmptyState />}
        {viewState === "loading" && <LoadingState />}
        {viewState === "error" && (
          <ErrorState
            message={
              error === "ADDRESS_NOT_FOUND"
                ? "We couldn't find that address. Try another."
                : "Something went wrong. Please try again."
            }
          >
            {searchBar}
          </ErrorState>
        )}
        {viewState === "result" && profile && (
          <ResultView profile={profile} />
        )}
      </div>
    </main>
  );
}
