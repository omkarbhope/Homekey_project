"use client";

type ErrorStateProps = {
  message?: string;
  children: React.ReactNode;
};

export function ErrorState({
  message = "We couldn't find that address. Try another.",
  children,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 px-4">
      <p className="text-red-600 text-center max-w-md font-medium text-base">
        {message}
      </p>
      <p className="text-slate-500 text-sm">Try a different address.</p>
      {children}
    </div>
  );
}
