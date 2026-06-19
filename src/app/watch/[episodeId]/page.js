import { getEpisodeStreaming, getAnimeDetail } from '@/lib/scraper';
import VideoPlayer from '@/components/VideoPlayer';
import HistoryTracker from '@/components/HistoryTracker';
import KeyboardNav from '@/components/KeyboardNav';
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const episode = await getEpisodeStreaming(params.episodeId);
  return {
    title: episode ? `${episode.title} - ShurizAnime` : 'Nonton - ShurizAnime',
  };
}

export default async function WatchPage({ params }) {
  const episode = await getEpisodeStreaming(params.episodeId);

  if (!episode) {
    notFound();
  }

  let animeMeta = null;
  if (episode.animeSlug) {
    try {
      const detail = await getAnimeDetail(episode.animeSlug);
      if (detail) {
        animeMeta = { title: detail.title, image: detail.image };
      }
    } catch {
      // best-effort enrichment for history; ignore failure
    }
  }

  const historyEntry = {
    episodeSlug: episode.slug || params.episodeId,
    episodeTitle: episode.title,
    animeSlug: episode.animeSlug || '',
    animeTitle: animeMeta?.title || '',
    image: animeMeta?.image || '',
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="flex items-center justify-between mb-6">
          {episode.animeSlug ? (
            <Link
              href={`/anime/${episode.animeSlug}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali ke Detail Anime
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>
          )}
        </div>

        {/* Side effects: track history + keyboard nav */}
        <HistoryTracker entry={historyEntry} />
        <KeyboardNav prevSlug={episode.prevSlug} nextSlug={episode.nextSlug} />

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold mb-6">{episode.title}</h1>
        {/* Video Player */}
        <VideoPlayer mirrors={episode.mirrors || []} title={episode.title} />
        {/* Episode Navigation */}
        <div className="flex items-center justify-between mt-6 mb-8">
          {episode.prevSlug ? (
            <Link
              href={`/watch/${episode.prevSlug}`}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-2.5 rounded-xl hover:bg-primary/20 hover:border-primary/30 transition-all text-sm font-medium"
            >
              <ChevronLeft size={16} />
              Episode Sebelumnya
            </Link>
          ) : (
            <div />
          )}

          {episode.nextSlug ? (
            <Link
              href={`/watch/${episode.nextSlug}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Episode Selanjutnya
              <ChevronRight size={16} />
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Download Links */}
        {episode.downloads?.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download size={18} className="text-primary" />
              Download Links
            </h3>
            <div className="space-y-4">
              {episode.downloads.map((dl, i) => (
                <div key={i}>
                  <div className="text-sm font-medium text-primary mb-2">{dl.quality}</div>
                  <div className="flex flex-wrap gap-2">
                    {dl.links.map((link, j) => (
                      <a
                        key={j}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/10 hover:bg-primary/20 border border-white/10 hover:border-primary/30 px-4 py-2 rounded-lg text-sm transition-all"
                      >
                        {link.server}
                      </a>
                ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}