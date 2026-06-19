export default function SkeletonCard() {
  return (
    <div className="block">
      <div className="aspect-[3/4] rounded-xl skeleton" />
      <div className="mt-3 px-1 space-y-2">
        <div className="h-4 rounded skeleton" />
        <div className="h-3 w-2/3 rounded skeleton" />
      </div>
    </div>
  );
}
