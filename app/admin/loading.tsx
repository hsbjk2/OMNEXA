export default function AdminLoading() {
  return (
    <div role="status" aria-label="Loading admin panel">
      <span className="sr-only">Loading admin panel…</span>
      <div className="flex flex-wrap items-end justify-between gap-4" aria-hidden>
        <div>
          <div className="skeleton h-3 w-24" />
          <div className="skeleton mt-3 h-9 w-56 max-w-full" />
          <div className="skeleton mt-3 h-3 w-72 max-w-full" />
        </div>
        <div className="skeleton h-10 w-36" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border border-line bg-white p-5">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton mt-4 h-8 w-16" />
            <div className="skeleton mt-4 h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="mt-6 border border-line bg-white" aria-hidden>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-8 w-24" />
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-5 py-4">
              <div className="skeleton size-10 shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton h-3 w-2/5" />
                <div className="skeleton h-3 w-1/4" />
              </div>
              <div className="skeleton h-6 w-20 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
