import { searchAnime } from '@/lib/scraper';
import AnimeGrid from '@/components/AnimeGrid';
import SearchBar from '@/components/SearchBar';
import { Search } from 'lucide-react';

export const metadata = {
  title: 'Cari Anime - ShurizAnime',
};

export default async function SearchPage({ searchParams }) {
  const query = searchParams?.q || '';
  let results = [];

  if (query) {
    results = await searchAnime(query);
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Cari</span> Anime
          </h1>
          <p className="text-gray-400 mb-8">
            Temukan anime favoritmu dengan mudah
          </p>
          <SearchBar initialQuery={query} />
        </div>

        {/* Results */}
        {query && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-6">
              <Search size={20} className="text-primary" />
              <h2 className="text-xl font-semibold">
                Hasil pencarian: <span className="text-primary">"{query}"</span>
              </h2>
              <span className="text-gray-400 text-sm">
                ({results.length} hasil)
              </span>
            </div>

            {results.length > 0 ? (
              <AnimeGrid animeList={results} />
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">😢</div>
                <h3 className="text-xl font-semibold mb-2">Anime tidak ditemukan</h3>
                <p className="text-gray-400">
                  Coba kata kunci lain atau periksa ejaan
                </p>
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Mulai Pencarian</h3>
            <p className="text-gray-400">
              Ketik judul anime yang ingin kamu cari
            </p>
          </div>
        )}
      </div>
    </div>
  );
}