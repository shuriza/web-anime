const HISTORY_KEY = 'shuriz:history';
const BOOKMARKS_KEY = 'shuriz:bookmarks';
const HISTORY_LIMIT = 100;

function safeRead(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeWrite(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('shuriz:storage', { detail: { key } }));
  } catch {
    // quota exceeded or disabled — silently ignore
  }
}

export function getHistory() {
  return safeRead(HISTORY_KEY) || [];
}

export function addHistory(entry) {
  if (!entry?.episodeSlug) return;
  const list = getHistory().filter((e) => e.episodeSlug !== entry.episodeSlug);
  list.unshift({ ...entry, watchedAt: Date.now() });
  if (list.length > HISTORY_LIMIT) list.length = HISTORY_LIMIT;
  safeWrite(HISTORY_KEY, list);
}

export function clearHistory() {
  safeWrite(HISTORY_KEY, []);
}

export function getContinueWatching(limit = 6) {
  const seen = new Set();
  const result = [];
  for (const entry of getHistory()) {
    if (!entry.animeSlug || seen.has(entry.animeSlug)) continue;
    seen.add(entry.animeSlug);
    result.push(entry);
    if (result.length >= limit) break;
  }
  return result;
}

export function getLastWatchedEpisode(animeSlug) {
  if (!animeSlug) return null;
  return getHistory().find((e) => e.animeSlug === animeSlug) || null;
}

export function getBookmarks() {
  return safeRead(BOOKMARKS_KEY) || [];
}

export function isBookmarked(slug) {
  if (!slug) return false;
  return getBookmarks().some((b) => b.slug === slug);
}

export function toggleBookmark(anime) {
  if (!anime?.slug) return false;
  const list = getBookmarks();
  const idx = list.findIndex((b) => b.slug === anime.slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    safeWrite(BOOKMARKS_KEY, list);
    return false;
  }
  list.unshift({
    slug: anime.slug,
    title: anime.title,
    image: anime.image,
    bookmarkedAt: Date.now(),
  });
  safeWrite(BOOKMARKS_KEY, list);
  return true;
}

export function subscribeStorage(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener('shuriz:storage', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('shuriz:storage', handler);
    window.removeEventListener('storage', handler);
  };
}
