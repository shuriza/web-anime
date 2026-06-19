import { getAnimeDetail } from '@/lib/scraper';
import EpisodeList from '@/components/EpisodeList';
import GenreBadge from '@/components/GenreBadge';
import BookmarkButton from '@/components/BookmarkButton';
import SafeImage from '@/components/SafeImage';
import { Star, Calendar, Clock, Film, Tv, Building2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const anime = await getAnimeDetail(params.slug);
  return {
    title: anime ? `${anime.title} - ShurizAnime` : 'Anime - ShurizAnime',
    description: anime?.synopsis?.substring(0, 160) || '',
  };
}

export default async function AnimeDetailPage({ params }) {
  const anime = await getAnimeDetail(params.slug);

  if (!anime) {
    notFound();
  }

  const infoItems = [
    { icon: Star, label: 'Score', value: anime.score },
    { icon: Tv, label: 'Type', value: anime.type },
    { icon: Film, label: 'Episodes', value: anime.totalEpisode },
    { icon: Clock, label: 'Duration', value: anime.duration },
    { icon: Calendar, label: 'Released', value: anime.releaseDate },
    { icon: Building2, label: 'Studio', value: anime.studio },
  ].filter(item => item.value);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
          style={{ backgroundImage: `url(${anime.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060612] via-[#060612]/80 to-[#060612]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060612]/90 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-64 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="w-[250px] rounded-2xl overflow-hidden glow-purple">
              <SafeImage
                src={anime.image}
                alt={anime.title}
                className="w-full h-[350px] object-cover"
                loading="eager"
              />
            </div>
            <div className="mt-4 w-[250px]">
              <BookmarkButton anime={{ slug: anime.slug, title: anime.title, image: anime.image }} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{anime.title}</h1>
            {anime.japaneseTitle && (
              <p className="text-gray-400 text-lg mb-4">{anime.japaneseTitle}</p>
            )}

            {/* Status Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  anime.status?.toLowerCase().includes('ongoing')
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {anime.status || 'Unknown'}
              </span>
              {anime.score && (
                <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                <Star size={14} fill="currentColor" />
                {anime.score}
                </span>
              )}
            </div>

            {/* Genres */}
            {anime.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {anime.genres.map((genre, i) => (
                  <GenreBadge key={i} genre={genre} />
                ))}
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {infoItems.map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <item.icon size={12} />
                    {item.label}
                  </div>
                  <div className="text-sm font-semibold">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Synopsis */}
            {anime.synopsis && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full"></div>
                Sinopsis
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {anime.synopsis}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Episode List */}
        <div className="mt-12 mb-16">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="w-1 h-7 bg-gradient-to-b from-primary to-accent rounded-full"></div>
            Daftar Episode
            <span className="text-sm font-normal text-gray-400">
              ({anime.episodes?.length || 0} episode)
            </span>
          </h3>
          <EpisodeList
            episodes={anime.episodes || []}
            animeTitle={anime.title}
            animeSlug={anime.slug}
          />
        </div>
      </div>
    </div>
  );
}