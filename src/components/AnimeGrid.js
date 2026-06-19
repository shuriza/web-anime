import AnimeCard from './AnimeCard';
export default function AnimeGrid({ animeList = [] }) {
  if (!animeList.length) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🎬</div>
        <p className="text-gray-400">Tidak ada anime untuk ditampilkan</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {animeList.map((anime, index) => (
        <AnimeCard key={`${anime.slug}-${index}`} anime={anime} />
      ))}
    </div>
  );
}