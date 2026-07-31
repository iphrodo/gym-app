import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen surface-page flex flex-col items-center justify-center gap-4 text-center px-6">
      <p className="font-black text-card-muted-fg">We couldn&apos;t find that.</p>
      <Link href="/" className="surface-card-inverted px-6 py-3 rounded-2xl font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
        Back to dashboard
      </Link>
    </div>
  );
}
