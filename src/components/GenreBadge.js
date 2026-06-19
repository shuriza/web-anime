import Link from 'next/link';
export default function GenreBadge({ genre }) {
  const slug = genre.slug || genre.name?.toLowerCase().replace(/\s+/g, '-') || '';

  return (
    <Link
      href={`/genre/${slug}`}
      className="bg-white/10 border border-white/10 hover:border-primary/30 hover:bg-primary/10 px-3 py-1 rounded-lg text-xs font-medium text-gray-300 hover:text-primary transition-all"
    >
      {genre.name}
    </Link>
  );
}