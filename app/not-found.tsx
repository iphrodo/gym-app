import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4 font-sans text-center px-6">
      <p className="font-black text-zinc-400">We couldn&apos;t find that.</p>
      <Link href="/" className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black">
        Back to dashboard
      </Link>
    </div>
  );
}
