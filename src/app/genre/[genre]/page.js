import { getAnimeByGenre } from '@/lib/scraper';
import AnimeGrid from '@/components/AnimeGrid';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const genreName = params.genre.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `Genre ${genreName} - ShurizAnime`,
  };
}

export default async function GenrePage({ params, searchParams }) {
  const genre = params.genre;
  const page = parseInt(searchParams?.page) || 1;
  const { anime, hasNext } = await getAnimeByGenre(genre, page);

  const genreName = genre.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
          <h1 className="text-3xl font-bold">
            Genre: <span className="gradient-text">{genreName}</span>
          </h1>
        </div>

        {anime.length > 0 ? (
          <AnimeGrid animeList={anime} />
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400">Tidak ada anime untuk genre ini</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-12">
          {page > 1 && (
            <Link
              href={`/genre/${genre}?page=${page - 1}`}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-2.5 rounded-xl hover:bg-primary/20 transition-all text-sm font-medium"
            >
              <ChevronLeft size={16} />
              Previous
            </Link>
          )}

          <span className="bg-primary/20 border border-primary/30 px-4 py-2 rounded-xl text-sm font-medium text-primary">
            Page {page}
          </span>

          {hasNext && (
            <Link
              href={`/genre/${genre}?page=${page + 1}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Next
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}