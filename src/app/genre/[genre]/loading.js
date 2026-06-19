import SkeletonGrid from '@/components/SkeletonGrid';

export default function GenreLoading() {
  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-9 w-64 rounded skeleton mb-8"></div>
        <SkeletonGrid count={18} />
      </div>
    </div>
  );
}
