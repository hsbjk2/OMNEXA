import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Info, Leaf, RotateCcw } from "lucide-react";
import {
  getCatalogCategories,
  normalizeSort,
  queryCatalog,
} from "@/lib/catalog";
import { CatalogFilters } from "@/components/shop/catalog-filters";
import { CatalogToolbar } from "@/components/shop/catalog-toolbar";
import { Pagination } from "@/components/shop/pagination";
import { ProductGrid } from "@/components/product/product-grid";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Explore the OMNEXA collection of skincare, makeup, makeup kits, artificial jewellery and accessories.",
  alternates: { canonical: "/shop" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const values = {
    q: first(params.q).slice(0, 80),
    category: first(params.category),
    sort: normalizeSort(first(params.sort)),
    price: first(params.price),
    stock: first(params.stock),
  };
  const page = first(params.page);

  const [{ products, total, pageCount, page: currentPage }, categories] =
    await Promise.all([
      queryCatalog({ ...values, page }),
      getCatalogCategories(),
    ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-forest/10 bg-forest text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-40 size-[560px] rounded-full border border-white/[0.06]" />
          <div className="absolute right-32 top-10 size-[210px] rounded-full bg-[radial-gradient(circle,rgba(168,217,22,0.14),transparent_70%)]" />
        </div>
        <div className="container-page relative z-10 py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.13em] text-white/35">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-white/65">Shop</span>
          </nav>
          <div className="mt-7 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-lime">The collection</p>
              <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.7rem,5.5vw,4.8rem)] leading-[0.94] tracking-[-0.04em]">
                Beauty, edited for
                <br />
                <span className="italic text-lime">the everyday.</span>
              </h1>
            </div>
            <p className="max-w-[300px] text-[0.85rem] leading-relaxed text-white/45">
              Skincare, colour, kits, jewellery and the finishing details —
              browse the full demo catalogue, filter by what matters and find
              your ritual.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container-page grid gap-8 py-10 sm:py-14 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
          <CatalogFilters
            categories={categories}
            values={values}
            basePath="/shop"
          />

          <div className="min-w-0">
            <div className="mb-5 flex items-start gap-2.5 border border-line bg-light/70 px-3.5 py-3 text-[0.68rem] leading-relaxed text-forest/60">
              <Info className="mt-0.5 size-3.5 shrink-0 text-forest/45" />
              <p>
                Demo catalogue: product details, imagery, pricing and stock are
                for this storefront preview. Checkout sends your bag to
                WhatsApp, where the seller confirms payment and delivery.
              </p>
            </div>

            <CatalogToolbar
              values={values}
              basePath="/shop"
              total={total}
              label={total === 1 ? "product" : "products"}
            />

            {products.length > 0 ? (
              <>
                <ProductGrid
                  products={products}
                  columns={3}
                  className="mt-7"
                />
                <Pagination
                  page={currentPage}
                  pageCount={pageCount}
                  basePath="/shop"
                  values={values}
                />
              </>
            ) : (
              <div className="flex flex-col items-center border border-line bg-white px-6 py-20 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-light text-forest">
                  <Leaf className="size-5" strokeWidth={1.3} />
                </span>
                <h2 className="mt-5 font-display text-3xl">
                  Nothing matches those filters.
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                  Try widening the price range, choosing another category or
                  clearing the filters entirely.
                </p>
                <Link href="/shop" className="btn btn-forest mt-6">
                  <RotateCcw className="size-3.5" /> Clear filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
