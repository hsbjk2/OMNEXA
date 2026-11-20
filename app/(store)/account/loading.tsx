export default function AccountLoading() {
  return (
    <div role="status" aria-label="Loading your account">
      <span className="sr-only">Loading your account…</span>
      <section className="border-b border-line bg-cream">
        <div className="container-page py-9 sm:py-12" aria-hidden>
          <div className="skeleton h-3 w-20" />
          <div className="skeleton mt-4 h-10 w-64 max-w-full" />
          <div className="skeleton mt-3 h-3 w-80 max-w-full" />
        </div>
      </section>
      <section className="section bg-soft">
        <div className="container-page" aria-hidden>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border border-line bg-white p-5">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton mt-4 h-8 w-12" />
                <div className="skeleton mt-4 h-3 w-24" />
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="border border-line bg-white p-5 sm:p-6">
              <div className="skeleton h-3 w-28" />
              <div className="mt-6 space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-4 border-t border-line pt-5">
                    <div className="skeleton size-16 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="skeleton h-3 w-2/3" />
                      <div className="skeleton h-3 w-1/3" />
                      <div className="skeleton h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-line bg-white p-5">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton mt-4 h-10 w-full" />
                <div className="skeleton mt-2 h-10 w-full" />
              </div>
              <div className="border border-line bg-white p-5">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton mt-4 h-3 w-full" />
                <div className="skeleton mt-2 h-3 w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
