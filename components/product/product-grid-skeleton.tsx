export function ProductGridSkeleton({
  count = 8,
  columns = 4,
}: {
  count?: number;
  columns?: 3 | 4;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:gap-y-12 ${
        columns === 4 ? "lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      <span className="sr-only">Loading products…</span>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} aria-hidden>
          <div className="skeleton aspect-[4/5] w-full" />
          <div className="skeleton mt-4 h-3 w-4/5" />
          <div className="skeleton mt-2.5 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
