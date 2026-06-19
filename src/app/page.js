import { getOngoingAnime, getCompletedAnime } from '@/lib/scraper';
import AnimeGrid from '@/components/AnimeGrid';
import HeroSlider from '@/components/HeroSlider';
import ContinueWatching from '@/components/ContinueWatching';
import Link from 'next/link';
import { Play, TrendingUp, Clock, Star } from 'lucide-react';

export const revalidate = 300;

export default async function HomePage() {
  const [ongoingData, completedData] = await Promise.all([
    getOngoingAnime(1),
    getCompletedAnime(1),
  ]);

  const ongoing = ongoingData?.anime || [];
  const completed = completedData?.anime || [];
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-[#060612]/50 to-[#060612]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-32 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 border-primary/30 rounded-full px-4 py-2 mb-6">
              <Play size={14} className="text-primary" />
              <span className="text-sm text-primary font-medium">Streaming Anime Sub Indo</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="gradient-text">Shuriz</span>
              <span className="text-white">Anime</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Nonton anime subtitle Indonesia terlengkap dan terupdate.
              Streaming gratis dengan kualitas terbaik!
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/ongoing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                <Play size={18} />
                Anime Ongoing
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                <Star size={18} />
                Cari Anime
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { icon: Play, label: 'Anime', value: '1000+' },
              { icon: Clock, label: 'Episode', value: '5000+' },
              { icon: TrendingUp, label: 'Ongoing', value: `${ongoing.length}+` },
              { icon: Star, label: 'Sub Indo', value: '100%' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border-white/10 rounded-xl p-4 text-center">
                <stat.icon size={20} className="text-primary mx-auto mb-2" />
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Slider */}
      {ongoing.length > 0 && <HeroSlider animeList={ongoing.slice(0, 8)} />}

      {/* Continue Watching (client, hidden if empty) */}
      <ContinueWatching />

      {/* Ongoing Anime */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="gradient-text">Ongoing</span> Anime
            </h2>
          </div>
          <Link
            href="/ongoing"
            className="text-primary hover:text-secondary transition-colors text-sm font-medium"
          >
            Lihat Semua →
          </Link>
        </div>
        <AnimeGrid animeList={ongoing.slice(0, 18)} />
      </section>

      {/* Completed Anime */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-accent to-[#00CEC9] rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="text-accent">Completed</span> Anime
            </h2>
          </div>
        </div>
        <AnimeGrid animeList={completed.slice(0, 18)} />
      </section>
    </div>
  );
}