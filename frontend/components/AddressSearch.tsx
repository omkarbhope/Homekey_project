"use client";

import { useState, useCallback } from "react";
import type { PropertyProfileResponse } from "@/lib/types";
import { fetchPropertyProfile } from "@/lib/api";

type AddressSearchProps = {
  onResult: (profile: PropertyProfileResponse) => void;
  onError: (error: "ADDRESS_NOT_FOUND" | "FETCH_FAILED") => void;
  onLoading: (loading: boolean) => void;
  disabled?: boolean;
  defaultValue?: string;
};

export function AddressSearch({
  onResult,
  onError,
  onLoading,
  disabled = false,
  defaultValue = "",
}: AddressSearchProps) {
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const address = value.trim();
      if (!address) return;
      setIsLoading(true);
      onLoading(true);
      try {
        const profile = await fetchPropertyProfile(address);
        onResult(profile);
      } catch (err) {
        onError(err instanceof Error ? (err.message as "ADDRESS_NOT_FOUND" | "FETCH_FAILED") : "FETCH_FAILED");
      } finally {
        setIsLoading(false);
        onLoading(false);
      }
    },
    [value, onResult, onError, onLoading]
  );

  const loading = disabled || isLoading;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl flex gap-2">
      <input
        type="text"
        placeholder="Enter full address"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
        className="flex-1 rounded-lg border border-slate-300 px-4 py-3.5 text-base text-slate-900 placeholder-slate-500 transition-colors hover:border-slate-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 disabled:bg-slate-100 disabled:cursor-not-allowed"
        aria-label="Address"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="rounded-lg bg-primary-600 px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" aria-hidden />
            Searching…
          </>
        ) : (
          "Search"
        )}
      </button>
    </form>
  );
}
