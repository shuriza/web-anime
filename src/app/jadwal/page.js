import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { getSchedule } from '@/lib/scraper';

export const revalidate = 86400;

export const metadata = {
  title: 'Jadwal Rilis Anime - ShurizAnime',
  description: 'Jadwal rilis anime mingguan terbaru di ShurizAnime',
};

export default async function JadwalPage() {
  const schedule = await getSchedule();

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar size={28} className="text-primary" />
            <span className="gradient-text">Jadwal</span> Rilis
          </h1>
        </div>

        {schedule.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Jadwal sedang tidak tersedia. Coba lagi nanti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedule.map((d) => (
              <div
                key={d.day}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-primary/30 transition-all"
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  {d.day}
                  <span className="text-xs font-normal text-gray-500">
                    ({d.anime.length})
                  </span>
                </h2>
                <ul className="space-y-1">
                  {d.anime.map((a, i) => (
                    <li key={`${a.slug}-${i}`}>
                      <Link
                        href={a.slug ? `/anime/${a.slug}` : '#'}
                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary py-1.5 px-2 rounded-lg hover:bg-white/5 transition-all group"
                      >
                        <ChevronRight
                          size={14}
                          className="text-gray-600 group-hover:text-primary flex-shrink-0"
                        />
                        <span className="truncate">{a.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
