'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, Trash2, Play } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { getHistory, clearHistory, subscribeStorage } from '@/lib/storage';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
}

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(getHistory());
    setHydrated(true);
    return subscribeStorage(() => setItems(getHistory()));
  }, []);

  const handleClear = () => {
    if (confirm('Hapus semua riwayat tontonan?')) {
      clearHistory();
      setItems([]);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <History size={28} className="text-primary" />
              <span className="gradient-text">Riwayat</span> Tontonan
            </h1>
            {hydrated && items.length > 0 && (
              <span className="text-sm text-gray-400">({items.length})</span>
            )}
          </div>
          {hydrated && items.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-accent/20 border border-white/10 hover:border-accent/30 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            >
              <Trash2 size={14} />
              Hapus Semua
            </button>
          )}
        </div>

        {!hydrated ? (
          <div className="text-center py-20 text-gray-400">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-semibold mb-2">Belum Ada Riwayat</h3>
            <p className="text-gray-400">
              Mulai nonton anime, riwayat akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.episodeSlug}
                href={`/watch/${item.episodeSlug}`}
                className="flex gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-2xl p-3 transition-all group"
              >
                <div className="relative w-24 sm:w-32 aspect-[3/4] flex-shrink-0 rounded-xl overflow-hidden bg-[#1a1a2e]">
                  <SafeImage
                    src={item.image}
                    alt={item.animeTitle || item.episodeTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={24} className="text-white" fill="white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {item.animeTitle || item.episodeTitle}
                  </h3>
                  {item.episodeTitle && (
                    <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                      {item.episodeTitle}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{timeAgo(item.watchedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
