'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/20 border border-accent/30 rounded-full mb-6">
          <AlertTriangle size={40} className="text-accent" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Ada yang Tidak Beres</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Sepertinya server sumber sedang bermasalah atau koneksi terputus.
          Coba lagi atau kembali ke beranda.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors"
          >
            <Home size={16} />
            Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  );
}
