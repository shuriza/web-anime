import SkeletonGrid from '@/components/SkeletonGrid';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full skeleton"></div>
          <div className="h-8 w-48 rounded skeleton"></div>
        </div>
        <SkeletonGrid count={12} />
      </div>
    </div>
  );
}
