import Link from 'next/link';
import { Play, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a1a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Play size={16} fill="white" className="text-white ml-0.5" />
              </div>
              <span className="text-xl font-black">
                <span className="gradient-text">Shuriz</span>
                <span className="text-white">Anime</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              ShurizAnime adalah tempat nonton anime subtitle Indonesia terlengkap
              dan terupdate. Streaming anime gratis dengan kualitas terbaik.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Navigasi</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/ongoing', label: 'Ongoing' },
                { href: '/jadwal', label: 'Jadwal' },
                { href: '/genre', label: 'Genre' },
                { href: '/bookmarks', label: 'Bookmark' },
                { href: '/history', label: 'Riwayat' },
                { href: '/search', label: 'Cari Anime' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genre */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Genre Populer</h4>
            <ul className="space-y-2">
              {['Action', 'Romance', 'Comedy', 'Fantasy', 'Isekai'].map((genre) => (
                <li key={genre}>
                  <Link
                href={`/genre/${genre.toLowerCase()}`}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {genre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; 2024 ShurizAnime. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-accent" fill="currentColor" /> by ShurizAnime Team
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#060612] border-t border-white/5 px-4 py-3">
        <p className="text-center text-gray-600 text-xs max-w-4xl mx-auto">
          Disclaimer: ShurizAnime tidak menyimpan file video di server kami. Semua video
          berasal dari pihak ketiga. Kami hanya menyediakan link embed dari sumber lain.
        </p>
      </div>
    </footer>
  );
}