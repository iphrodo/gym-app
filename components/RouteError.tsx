"use client";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RouteError({ error, reset }: RouteErrorProps) {
  return (
    <div className="min-h-screen surface-page flex flex-col items-center justify-center gap-4 font-black text-card-muted-fg text-center px-6">
      <p>{error.message || "Something went wrong."}</p>
      <button
        onClick={reset}
        className="surface-card-inverted px-6 py-3 rounded-2xl font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        Retry
      </button>
    </div>
  );
}
