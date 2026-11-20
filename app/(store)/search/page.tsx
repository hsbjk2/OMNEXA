import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import {
  getCatalogCategories,
  normalizeSort,
  queryCatalog,
} from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { productCardInclude, toProductCard } from "@/lib/products";
import { ProductGrid } from "@/components/product/product-grid";
import { CatalogFilters } from "@/components/shop/catalog-filters";
import { CatalogToolbar } from "@/components/shop/catalog-toolbar";
import { Pagination } from "@/components/shop/pagination";
import { SearchRecorder } from "@/components/shop/search-recorder";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the OMNEXA collection.",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = first(params.q).trim().slice(0, 80);
  const values = {
    q,
    category: first(params.category),
    sort: normalizeSort(first(params.sort)),
    price: first(params.price),
    stock: first(params.stock),
  };

  const [categories, result, popular] = await Promise.all([
    getCatalogCategories(),
    q.length >= 2
      ? queryCatalog({ ...values, page: first(params.page) }, { includeComingSoon: true })
      : Promise.resolve(null),
    q.length >= 2
      ? Promise.resolve([])
      : prisma.product
          .findMany({
            where: {
              isPublished: true,
              status: { not: "COMING_SOON" },
            },
            include: productCardInclude,
            orderBy: [{ viewCount: "desc" }],
            take: 4,
          })
          .then((rows) => rows.map(toProductCard)),
  ]);

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-page py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-forest/45">Search OMNEXA</p>
            <h1 className="mt-4 font-display text-[clamp(2.7rem,5.5vw,4.7rem)] leading-[0.95] tracking-[-0.04em]">
              {q.length >= 2 ? (
                <>
                  Results for{" "}
                  <span className="italic text-forest/60">“{q}”</span>
                </>
              ) : (
                <>
                  What are you
                  <br />
                  <span className="italic text-forest/60">looking for?</span>
                </>
              )}
            </h1>
            <form action="/search" method="get" className="mx-auto mt-7 max-w-xl">
              <div className="flex items-stretch border border-forest/20 bg-white p-1 transition focus-within:border-forest/45 focus-within:shadow-[0_20px_50px_-40px_rgba(5,44,25,0.55)]">
                <div className="flex min-w-0 flex-1 items-center gap-3 pl-3">
                  <Search className="size-[18px] shrink-0 text-forest/40" strokeWidth={1.5} />
                  <label htmlFor="search-page-input" className="sr-only">
                    Search products
                  </label>
                  <input
                    id="search-page-input"
                    type="search"
                    name="q"
                    defaultValue={q}
                    maxLength={80}
                    autoFocus={false}
                    placeholder="Skincare, lipstick, pearl earrings…"
                    className="search-input h-12 w-full min-w-0 bg-transparent font-display text-lg text-ink outline-none placeholder:text-ink/30 sm:text-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-forest h-12 shrink-0 px-4 text-[0.6rem] tracking-[0.12em] sm:px-6"
                >
                  Search <ArrowRight className="size-3.5" />
                </button>
              </div>
            </form>
            <p className="mt-3 text-[0.68rem] text-muted/70">
              Search by product, ritual or category.
            </p>
            {q.length < 2 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[0.56rem] font-bold uppercase tracking-[0.14em] text-muted/50">
                  Try
                </span>
                {["Facial oil", "Lipstick", "Pearl", "Makeup kit"].map((entry) => (
                  <Link
                    key={entry}
                    href={`/search?q=${encodeURIComponent(entry)}`}
                    className="tag bg-white py-1.5 transition hover:border-forest hover:text-forest"
                  >
                    {entry}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {q.length >= 2 && result ? (
        <section className="bg-soft">
          <SearchRecorder query={q} />
          <div className="container-page grid gap-8 py-10 sm:py-14 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
            <CatalogFilters
              categories={categories}
              values={values}
              basePath="/search"
            />

            <div className="min-w-0">
              <CatalogToolbar
                values={values}
                basePath="/search"
                total={result.total}
                label={result.total === 1 ? "result" : "results"}
              />

              {result.products.length > 0 ? (
                <>
                  <ProductGrid
                    products={result.products}
                    columns={3}
                    className="mt-7"
                  />
                  <Pagination
                    page={result.page}
                    pageCount={result.pageCount}
                    basePath="/search"
                    values={values}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center border border-line bg-white px-6 py-16 text-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-light text-forest">
                    <Search className="size-5" strokeWidth={1.3} />
                  </span>
                  <h2 className="mt-5 font-display text-3xl">
                    No matches for “{q}”.
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                    Check the spelling, try a broader term, or start from one of
                    the categories below.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {categories.slice(0, 4).map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="tag bg-white py-2 transition hover:border-forest hover:text-forest"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                  <Link href="/shop" className="btn btn-forest mt-6">
                    Browse everything <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="section bg-soft">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex items-center justify-center gap-2 text-forest/50">
                <Sparkles className="size-4 text-bright" />
                <p className="eyebrow">Start with a word</p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Try “serum”, “lipstick”, “pearl”, “kit” — or explore a category
                below.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="tag bg-white py-2 transition hover:border-forest hover:text-forest"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {popular.length > 0 && (
              <div className="mt-14">
                <div className="flex items-end justify-between border-b border-line pb-4">
                  <div>
                    <p className="eyebrow text-forest/45">A place to begin</p>
                    <h2 className="title-md mt-2">The most-viewed pieces</h2>
                  </div>
                  <Link
                    href="/shop"
                    className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-forest transition hover:text-bright"
                  >
                    Shop all
                  </Link>
                </div>
                <ProductGrid products={popular} className="mt-8" />
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
