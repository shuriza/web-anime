'use client';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Monitor, AlertCircle, Sparkles, Play, Film, ChevronRight, Loader2 } from 'lucide-react';
import Hls from 'hls.js';

function qualityRank(q) {
  const m = String(q || '').match(/(\d+)\s*p?/i);
  return m ? parseInt(m[1], 10) : 0;
}

function qualityLabel(q) {
  if (!q || q.toLowerCase() === 'default') return 'Default';
  const m = String(q).match(/(\d+)\s*p?/i);
  return m ? `${m[1]}p` : q;
}

export default function VideoPlayer({ mirrors = [], title = '' }) {
  const grouped = useMemo(() => {
    const map = new Map();
    for (const m of mirrors) {
      const key = qualityLabel(m.quality);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    }
    return [...map.entries()]
      .map(([quality, items]) => ({ quality, items }))
      .sort((a, b) => qualityRank(b.quality) - qualityRank(a.quality));
  }, [mirrors]);

  const [selectedQuality, setSelectedQuality] = useState(grouped[0]?.quality || '');
  const [selectedServer, setSelectedServer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState('');
  const [resolvedPlayer, setResolvedPlayer] = useState('embed');
  const [resolving, setResolving] = useState(false);
  const [mirrorError, setMirrorError] = useState('');
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const handleVideoError = useCallback(() => {
    setMirrorError('Video gagal diputar oleh browser. Coba pilih server lain.');
  }, []);

  const activeGroup = grouped.find((g) => g.quality === selectedQuality) || grouped[0];
  const activeServers = activeGroup?.items || [];
  const serverOptions = activeServers.length > 1
    ? activeServers
    : mirrors.filter((mirror) => qualityLabel(mirror.quality) === (activeGroup?.quality || selectedQuality));
  const currentMirror = serverOptions[selectedServer] || serverOptions[0];
  const isHighest = activeGroup === grouped[0];

  const resolveMirror = useCallback(async (mirror) => {
    if (!mirror) return;
    setResolving(true);
    setMirrorError('');
    setResolvedUrl('');
    setResolvedPlayer('embed');

    if (mirror.url) {
      setResolvedUrl(mirror.url);
      setResolvedPlayer(mirror.player || 'embed');
      setResolving(false);
      return;
    }

    if (!mirror.payload) {
      setResolvedUrl('');
      setMirrorError('Source video tidak tersedia untuk mirror ini.');
      setResolving(false);
      return;
    }

    try {
      const res = await fetch('/api/mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: mirror.payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Gagal memuat video.');
      }
      setResolvedUrl(data.url);
      setResolvedPlayer(data.player || 'embed');
    } catch (e) {
      setResolvedUrl('');
      setMirrorError(e.message || 'Gagal memuat video. Coba pilih server lain.');
    } finally {
      setResolving(false);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || resolvedPlayer !== 'hls' || !resolvedUrl) return undefined;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = resolvedUrl;
      return () => {
        video.removeAttribute('src');
        video.load();
      };
    }

    if (!Hls.isSupported()) {
      setMirrorError('Browser ini tidak mendukung pemutaran HLS.');
      return undefined;
    }

    const inheritedQuery = new URL(resolvedUrl).search;
    const BaseLoader = Hls.DefaultConfig.loader;
    class QueryPreservingLoader extends BaseLoader {
      load(context, config, callbacks) {
        const requestUrl = new URL(context.url, resolvedUrl);
        if (!requestUrl.search && inheritedQuery) {
          requestUrl.search = inheritedQuery;
          context.url = requestUrl.toString();
        }
        super.load(context, config, callbacks);
      }
    }

    const hls = new Hls({
      enableWorker: true,
      loader: QueryPreservingLoader,
      fLoader: QueryPreservingLoader,
    });
    hlsRef.current = hls;
    hls.loadSource(resolvedUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) setMirrorError('Stream HLS gagal dimuat. Coba mirror lain.');
    });

    return () => {
      hls.destroy();
      hlsRef.current = null;
    };
  }, [resolvedPlayer, resolvedUrl]);

  useEffect(() => {
    if (isPlaying) {
      resolveMirror(currentMirror);
    } else {
      setResolvedUrl('');
      setResolvedPlayer('embed');
    }
  }, [isPlaying, currentMirror, resolveMirror]);

  useEffect(() => {
    setSelectedServer(0);
  }, [selectedQuality]);

  // Reset state saat navigasi ke episode lain (mirrors berubah)
  useEffect(() => {
    setIsPlaying(false);
    setSelectedQuality(grouped[0]?.quality || '');
    setSelectedServer(0);
    setResolvedUrl('');
    setResolvedPlayer('embed');
  }, [mirrors]);

  if (!mirrors.length) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <AlertCircle size={48} className="text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Video Tidak Tersedia</h3>
        <p className="text-gray-400 text-sm">
          Maaf, video untuk episode ini belum tersedia atau sedang dalam perbaikan.
        </p>
      </div>
    );
  }

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div>
      {/* ========== PRE-PLAY SCREEN ========== */}
      {!isPlaying ? (
        <div className="bg-black rounded-2xl overflow-hidden glow-purple">
          <div className="video-container">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-black/95 to-black flex flex-col items-center justify-center px-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <Film size={24} className="text-accent" />
                <h3 className="text-lg md:text-xl font-bold text-white">Pilih Kualitas Video</h3>
              </div>
              <p className="text-gray-400 text-xs md:text-sm mb-5 text-center">
                Pilih kualitas yang diinginkan, lalu klik Mulai Tonton
              </p>

              {/* Quality Buttons */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4">
                {grouped.map((g, i) => {
                  const active = g.quality === selectedQuality;
                  const best = i === 0;
                  return (
                    <button
                      key={g.quality}
                      onClick={() => setSelectedQuality(g.quality)}
                      className={`relative px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-sm md:text-base font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 scale-105'
                          : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30 hover:scale-105'
                      }`}
                    >
                      {g.quality}
                      {best && (
                        <span className={`ml-1.5 text-[10px] md:text-xs px-1.5 py-0.5 rounded-full ${
                          active ? 'bg-white/20 text-white' : 'bg-accent/20 text-accent'
                        }`}>
                          HD
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Server Selection (pre-play) */}
              {serverOptions.length > 1 && (
                <div className="mb-5 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Monitor size={14} className="text-primary" />
                    <span className="text-xs font-medium text-gray-400">
                      Server ({selectedQuality}):
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {serverOptions.map((mirror, index) => (
                      <button
                        key={`pre-${mirror.url}-${index}`}
                        onClick={() => setSelectedServer(index)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedServer === index
                            ? 'bg-gradient-to-r from-primary to-accent text-white'
                            : 'bg-white/10 border border-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        {mirror.server || `Server ${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Play Button */}
              <button
                onClick={handlePlay}
                className="group flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-2xl text-sm md:text-base font-bold transition-all duration-300 shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:scale-105 active:scale-95"
              >
                <Play size={20} className="fill-white group-hover:scale-110 transition-transform" />
                Mulai Tonton
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ========== PLAYING MODE ========== */}

          {/* Quality Selection (during playback) */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-1">
              <Sparkles size={16} className="text-accent" />
              <span className="text-sm font-medium text-gray-300">Kualitas:</span>
            </div>
            {grouped.map((g, i) => {
              const active = g.quality === selectedQuality;
              const best = i === 0;
              return (
                <button
                  key={g.quality}
                  onClick={() => setSelectedQuality(g.quality)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-primary to-accent text-white'
                      : 'bg-white/10 border border-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {g.quality}
                  {best && !active && (
                    <span className="ml-1 text-[10px] text-accent">HD</span>
                  )}
                </button>
              );
            })}
            {!isHighest && grouped[0] && (
              <button
                onClick={() => setSelectedQuality(grouped[0].quality)}
                className="ml-auto text-xs text-accent hover:underline font-medium"
              >
                ↑ Pakai kualitas tertinggi ({grouped[0].quality})
              </button>
            )}
          </div>

          {/* Video Container */}
          <div className="bg-black rounded-2xl overflow-hidden glow-purple">
            <div className="video-container">
              {resolving ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300">
                  <Loader2 size={32} className="animate-spin text-accent" />
                  <span className="text-sm">Memuat source video...</span>
                </div>
              ) : mirrorError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
                  <AlertCircle size={36} className="text-red-400" />
                  <p className="text-red-300 text-sm font-medium">{mirrorError}</p>
                  <p className="text-gray-500 text-xs">
                    Coba pilih server atau kualitas lain.
                  </p>
                </div>
              ) : resolvedUrl && (resolvedPlayer === 'direct' || resolvedPlayer === 'hls') ? (
                <video
                  ref={videoRef}
                  key={`${resolvedPlayer}-${resolvedUrl}`}
                  controls
                  playsInline
                  preload="metadata"
                  src={resolvedPlayer === 'direct' ? resolvedUrl : undefined}
                  onError={handleVideoError}
                  title={title}
                  className="h-full w-full rounded-2xl"
                />
              ) : resolvedUrl ? (
                <iframe
                  key={resolvedUrl}
                  src={resolvedUrl}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="no-referrer"
                  title={title}
                  className="rounded-2xl"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  Pilih kualitas untuk mulai
                </div>
              )}
            </div>
          </div>

          {/* Server Selection (during playback) */}
          {serverOptions.length > 1 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Monitor size={16} className="text-primary" />
                <span className="text-sm font-medium text-gray-300">
                  Server <span className="text-gray-500">({selectedQuality})</span>:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {serverOptions.map((mirror, index) => (
                  <button
                    key={`${mirror.url}-${index}`}
                    onClick={() => setSelectedServer(index)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedServer === index
                        ? 'bg-gradient-to-r from-primary to-accent text-white'
                        : 'bg-white/10 border border-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {mirror.server || `Server ${index + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Tip: Kalau video macet, coba pilih server lain di kualitas yang sama, atau turunkan kualitasnya.
          </p>
        </>
      )}
    </div>
  );
}
