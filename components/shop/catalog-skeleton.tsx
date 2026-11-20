import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export function CatalogSkeleton() {
  return (
    <div role="status" aria-label="Loading the catalogue">
      <span className="sr-only">Loading the catalogue…</span>

      <section className="border-b border-line bg-cream">
        <div className="container-page py-12 sm:py-16">
          <div className="skeleton h-3 w-24" aria-hidden />
          <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div aria-hidden>
              <div className="skeleton h-12 w-[280px] max-w-[70vw] sm:h-14 sm:w-[420px]" />
              <div className="skeleton mt-3 h-12 w-[220px] max-w-[55vw] sm:h-14 sm:w-[330px]" />
            </div>
            <div className="space-y-2" aria-hidden>
              <div className="skeleton h-3 w-[230px] max-w-full" />
              <div className="skeleton h-3 w-[190px] max-w-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container-page grid gap-8 py-10 sm:py-14 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
          <aside className="hidden lg:block" aria-hidden>
            <div className="skeleton h-3 w-20" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="skeleton h-8 w-full" />
              ))}
            </div>
          </aside>
          <div className="min-w-0">
            <div className="mb-6 flex items-center justify-between gap-4" aria-hidden>
              <div className="skeleton h-3 w-36" />
              <div className="skeleton h-9 w-28" />
            </div>
            <ProductGridSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
