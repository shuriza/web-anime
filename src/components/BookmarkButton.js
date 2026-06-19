'use client';
import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { isBookmarked, toggleBookmark, subscribeStorage } from '@/lib/storage';

export default function BookmarkButton({ anime }) {
  const [active, setActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setActive(isBookmarked(anime.slug));
    setHydrated(true);
    return subscribeStorage(() => setActive(isBookmarked(anime.slug)));
  }, [anime.slug]);

  const handleClick = () => {
    const nowActive = toggleBookmark(anime);
    setActive(nowActive);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
        active
          ? 'bg-gradient-to-r from-primary to-accent text-white'
          : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
      }`}
      aria-pressed={active}
      aria-label={active ? 'Hapus dari bookmark' : 'Tambah ke bookmark'}
    >
      {active ? <BookmarkCheck size={16} fill="currentColor" /> : <Bookmark size={16} />}
      {hydrated ? (active ? 'Tersimpan' : 'Bookmark') : 'Bookmark'}
    </button>
  );
}
