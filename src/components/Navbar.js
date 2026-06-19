'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, Play } from 'lucide-react';
import RandomAnimeButton from './RandomAnimeButton';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/ongoing', label: 'Ongoing' },
    { href: '/jadwal', label: 'Jadwal' },
    { href: '/genre', label: 'Genre' },
    { href: '/bookmarks', label: 'Bookmark' },
    { href: '/history', label: 'Riwayat' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#060612]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Play size={16} fill="white" className="text-white ml-0.5" />
            </div>
            <span className="text-xl font-black">
              <span className="gradient-text">Shuriz</span>
              <span className="text-white">Anime</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Search + Random */}
          <div className="hidden lg:flex items-center gap-3">
            <RandomAnimeButton className="bg-white/10 border border-white/10 hover:bg-white/20 text-gray-300 hover:text-white px-3 py-2 rounded-xl" />
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari anime..."
                  className="bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all w-56"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-[#0a0a1a]/95 backdrop-blur-xl border-t border-white/5 rounded-b-2xl">
            <div className="px-4 py-4 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari anime..."
                    className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </form>
              <RandomAnimeButton className="w-full justify-center bg-white/10 border border-white/10 text-gray-300 px-4 py-2.5 rounded-xl" />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-white transition-colors py-2 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}