'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, CheckCircle2 } from 'lucide-react';
import { getLastWatchedEpisode, subscribeStorage } from '@/lib/storage';

export default function EpisodeList({ episodes = [], animeTitle = '', animeSlug = '' }) {
  const [lastSlug, setLastSlug] = useState(null);

  useEffect(() => {
    if (!animeSlug) return;
    const update = () => setLastSlug(getLastWatchedEpisode(animeSlug)?.episodeSlug || null);
    update();
    return subscribeStorage(update);
  }, [animeSlug]);

  if (!episodes.length) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-gray-400">Belum ada episode tersedia</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {episodes.map((ep, index) => {
          const isLastWatched = lastSlug && ep.slug === lastSlug;
          return (
            <Link
              key={`${ep.slug}-${index}`}
              href={`/watch/${ep.slug}`}
              className={`episode-btn group flex items-center gap-2 border rounded-xl px-4 py-3 transition-all ${
                isLastWatched
                  ? 'bg-primary/15 border-primary/40'
                  : 'bg-white/5 border-white/10 hover:border-primary/30'
              }`}
            >
              {isLastWatched ? (
                <CheckCircle2
                  size={14}
                  className="text-accent flex-shrink-0"
                />
              ) : (
                <Play
                  size={14}
                  className="text-primary flex-shrink-0 group-hover:text-white transition-colors"
                />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate group-hover:text-white transition-colors">
                  {ep.title.replace(animeTitle, '').trim() || ep.title}
                </div>
                {isLastWatched ? (
                  <div className="text-xs text-accent truncate">Terakhir ditonton</div>
                ) : ep.date ? (
                  <div className="text-xs text-gray-500 truncate">{ep.date}</div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}