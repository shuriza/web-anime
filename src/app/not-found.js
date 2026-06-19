import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export const metadata = {
  title: '404 - Halaman Tidak Ditemukan | ShurizAnime',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-400 mb-8">
          Anime yang kamu cari mungkin sudah dihapus atau pindah ke alamat lain.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Home size={16} />
            Kembali ke Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors"
          >
            <Search size={16} />
            Cari Anime
          </Link>
        </div>
      </div>
    </div>
  );
}
