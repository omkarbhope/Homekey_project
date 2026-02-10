"use client";

function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
      aria-hidden
    />
  );
}

export function ResultSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full overflow-hidden">
      {/* Left: map skeleton */}
      <div className="h-[50vh] lg:h-full lg:w-1/2 min-w-0 min-h-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-100 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-slate-200/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" aria-hidden />
            <SkeletonBar className="h-4 w-32" />
          </div>
        </div>
      </div>
      {/* Right: tabs + content skeleton */}
      <div className="flex-1 lg:w-1/2 min-w-0 flex flex-col min-h-0 bg-slate-50">
        <div className="shrink-0 flex border-b border-slate-200 bg-white">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBar key={i} className="h-12 w-24 mx-1 my-2 rounded" />
          ))}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden p-4 space-y-4">
          <SkeletonBar className="h-6 w-3/4" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-5/6" />
          <div className="pt-4 space-y-3">
            <SkeletonBar className="h-20 w-full rounded-lg" />
            <SkeletonBar className="h-20 w-full rounded-lg" />
            <SkeletonBar className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
