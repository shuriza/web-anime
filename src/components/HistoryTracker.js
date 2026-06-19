'use client';
import { useEffect } from 'react';
import { addHistory } from '@/lib/storage';

export default function HistoryTracker({ entry }) {
  useEffect(() => {
    if (!entry?.episodeSlug) return;
    addHistory(entry);
  }, [entry?.episodeSlug, entry?.animeSlug, entry?.image, entry?.animeTitle, entry?.episodeTitle]);

  return null;
}
