import Link from 'next/link';
import { Tags } from 'lucide-react';
import { getGenreList } from '@/lib/scraper';

export const revalidate = 86400;

export const metadata = {
  title: 'Daftar Genre Anime - ShurizAnime',
  description: 'Jelajahi semua genre anime di ShurizAnime',
};

export default async function GenreIndexPage() {
  const genres = await getGenreList();

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Tags size={28} className="text-primary" />
            <span className="gradient-text">Genre</span> Anime
          </h1>
          {genres.length > 0 && (
            <span className="text-sm text-gray-400">({genres.length})</span>
          )}
        </div>

        {genres.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Daftar genre tidak tersedia.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {genres.map((g) => (
              <Link
                key={g.slug}
                href={`/genre/${g.slug}`}
                className="px-4 py-2 bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/10 rounded-xl text-sm font-medium text-gray-300 hover:text-primary transition-all"
              >
                {g.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
