'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar({ initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik judul anime..."
          className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-32 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all text-lg"
        />
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Cari
        </button>
      </div>
    </form>
  );
}