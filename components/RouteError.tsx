"use client";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RouteError({ error, reset }: RouteErrorProps) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4 font-sans font-black text-zinc-400 text-center px-6">
      <p>{error.message || "Something went wrong."}</p>
      <button
        onClick={reset}
        className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black"
      >
        Retry
      </button>
    </div>
  );
}
