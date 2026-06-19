import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import SafeImage from './SafeImage';

export default function AnimeCard({ anime }) {
  const href = anime.slug ? `/anime/${anime.slug}` : '#';

  return (
    <Link href={href} className="anime-card group block">
      <div className="relative rounded-xl overflow-hidden bg-[#1a1a2e]">
        {/* Image */}
        <div className="aspect-[3/4] overflow-hidden">
          <SafeImage
            src={anime.image}
            alt={anime.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Overlay */}
        <div className="anime-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 bg-primary/90 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play size={24} fill="white" className="text-white ml-1" />
          </div>
        </div>
        {/* Episode Badge */}
        {anime.episode && (
          <div className="absolute top-2 left-2">
            <span className="badge-new">{anime.episode}</span>
          </div>
        )}

        {/* Score Badge */}
        {anime.score && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 bg-black/70 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded-md text-xs font-semibold">
              <Star size={10} fill="currentColor" />
              {anime.score}
            </span>
          </div>
        )}

        {/* Day Badge */}
        {anime.day && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-primary/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium">
              {anime.day}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mt-3 px-1">
        <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
          {anime.title}
        </h3>
        {anime.date && (
          <p className="text-xs text-gray-500 mt-1">{anime.date}</p>
        )}
      </div>
    </Link>
  );
}