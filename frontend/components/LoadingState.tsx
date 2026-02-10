"use client";

type LoadingStateProps = {
  children?: React.ReactNode;
};

export function LoadingState({ children }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 px-4">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600"
        aria-hidden
      />
      <p className="text-slate-600 text-base">Finding location and property details…</p>
      {children}
    </div>
  );
}
