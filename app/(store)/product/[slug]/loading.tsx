export default function ProductLoading() {
  return (
    <div role="status" aria-label="Loading product" className="bg-soft">
      <span className="sr-only">Loading product…</span>
      <div className="container-page py-6" aria-hidden>
        <div className="skeleton h-3 w-52 max-w-full" />
      </div>
      <div className="container-page grid gap-8 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20">
        <div aria-hidden>
          <div className="skeleton aspect-[4/5] w-full" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton aspect-square w-full" />
            ))}
          </div>
        </div>
        <div className="lg:pt-4" aria-hidden>
          <div className="skeleton h-3 w-28" />
          <div className="skeleton mt-4 h-12 w-[85%]" />
          <div className="skeleton mt-3 h-12 w-[60%]" />
          <div className="skeleton mt-6 h-5 w-32" />
          <div className="mt-7 space-y-2.5">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-4/5" />
          </div>
          <div className="mt-8 skeleton h-12 w-40" />
          <div className="mt-6 skeleton h-12 w-full" />
          <div className="mt-3 skeleton h-12 w-full" />
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
