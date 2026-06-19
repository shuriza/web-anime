'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function HeroSlider({ animeList = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (animeList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % animeList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [animeList.length]);

  if (!animeList.length) return null;

  const anime = animeList[current];

  return (
    <section className="relative max-w-7xl mx-auto px-4 py-8">
      <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${anime.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060612] via-[#060612]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060612] via-transparent to-transparent" />

        {/* Content */}
        <div className="relative h-full flex items-end p-8">
          <div className="max-w-lg">
            {anime.episode && (
              <span className="badge-new mb-3 inline-block">{anime.episode}</span>
            )}
            <h2 className="text-2xl md:text-3xl font-bold mb-3 line-clamp-2">
              {anime.title}
            </h2>
            <Link
              href={`/anime/${anime.slug}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Play size={16} fill="white" />
              Tonton Sekarang
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <button
          onClick={() => setCurrent((prev) => (prev - 1 + animeList.length) % animeList.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary/50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % animeList.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary/50 transition-colors"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 right-8 flex gap-1.5">
          {animeList.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-primary w-6' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}