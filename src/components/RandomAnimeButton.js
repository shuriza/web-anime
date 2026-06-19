'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shuffle, Loader2 } from 'lucide-react';

export default function RandomAnimeButton({ className = '' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/random', { cache: 'no-store' });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      if (data.slug) router.push(`/anime/${data.slug}`);
    } catch {
      alert('Gagal mengambil anime acak. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 transition-all ${className}`}
      aria-label="Anime acak"
      title="Anime acak"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Shuffle size={16} />}
      <span className="hidden sm:inline text-sm font-medium">Random</span>
    </button>
  );
}
