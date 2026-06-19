'use client';
import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import AnimeGrid from '@/components/AnimeGrid';
import { getBookmarks, subscribeStorage } from '@/lib/storage';

export default function BookmarksPage() {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(getBookmarks());
    setHydrated(true);
    return subscribeStorage(() => setItems(getBookmarks()));
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bookmark size={28} className="text-primary" />
            <span className="gradient-text">Bookmark</span> Saya
          </h1>
          {hydrated && items.length > 0 && (
            <span className="text-sm text-gray-400">({items.length})</span>
          )}
        </div>

        {!hydrated ? (
          <div className="text-center py-20 text-gray-400">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-xl font-semibold mb-2">Belum Ada Bookmark</h3>
            <p className="text-gray-400">
              Klik tombol Bookmark di halaman anime untuk menyimpannya di sini
            </p>
          </div>
        ) : (
          <AnimeGrid animeList={items} />
        )}
      </div>
    </div>
  );
}
