'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, History } from 'lucide-react';
import { getContinueWatching, subscribeStorage } from '@/lib/storage';
import SafeImage from './SafeImage';

export default function ContinueWatching() {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(getContinueWatching(6));
    setHydrated(true);
    return subscribeStorage(() => setItems(getContinueWatching(6)));
  }, []);

  if (!hydrated || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <History size={24} className="text-accent" />
            <span className="gradient-text">Lanjut</span> Tonton
          </h2>
        </div>
        <Link
          href="/history"
          className="text-primary hover:text-secondary transition-colors text-sm font-medium"
        >
          Lihat Semua →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {items.map((item) => (
          <Link
            key={item.episodeSlug}
            href={`/watch/${item.episodeSlug}`}
            className="anime-card group block"
          >
            <div className="relative rounded-xl overflow-hidden bg-[#1a1a2e]">
              <div className="aspect-[3/4] overflow-hidden">
                <SafeImage
                  src={item.image}
                  alt={item.animeTitle || item.episodeTitle}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Play size={20} fill="white" className="text-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <span className="badge-new">Lanjut</span>
              </div>
            </div>
            <div className="mt-3 px-1">
              <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                {item.animeTitle || item.episodeTitle}
              </h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {item.episodeTitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
