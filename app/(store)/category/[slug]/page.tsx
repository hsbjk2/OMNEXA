import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Info, RotateCcw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getCatalogCategories,
  normalizeSort,
  queryCatalog,
} from "@/lib/catalog";
import { CatalogFilters } from "@/components/shop/catalog-filters";
import { CatalogToolbar } from "@/components/shop/catalog-toolbar";
import { Pagination } from "@/components/shop/pagination";
import { ProductGrid } from "@/components/product/product-grid";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: `${category.name} | OMNEXA`,
      description: category.description,
      images: [{ url: category.image }],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const query = await searchParams;

  const values = {
    q: first(query.q).slice(0, 80),
    category: "",
    sort: normalizeSort(first(query.sort)),
    price: first(query.price),
    stock: first(query.stock),
  };

  const [category, categories, result] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: {
              where: { isPublished: true, status: { not: "COMING_SOON" } },
            },
          },
        },
      },
    }),
    getCatalogCategories(),
    queryCatalog(
      { ...values, page: first(query.page) },
      { categorySlug: slug, perPage: 12 },
    ),
  ]);

  if (!category) notFound();

  const otherCategories = categories.filter((item) => item.slug !== slug).slice(0, 5);

  return (
    <>
      <section className="bg-forest text-white">
        <div className="container-page">
          <div className="grid items-stretch gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="py-12 sm:py-16 lg:py-20 lg:pr-12">
              <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.13em] text-white/35"
              >
                <Link href="/" className="transition hover:text-white">
                  Home
                </Link>
                <ChevronRight className="size-3" />
                <Link href="/categories" className="transition hover:text-white">
                  Categories
                </Link>
                <ChevronRight className="size-3" />
                <span className="text-white/65">{category.name}</span>
              </nav>
              <p className="eyebrow mt-8 text-lime">
                {category._count.products}{" "}
                {category._count.products === 1 ? "piece" : "pieces"} in the edit
              </p>
              <h1 className="mt-4 max-w-xl font-display text-[clamp(2.8rem,5.5vw,5rem)] leading-[0.92] tracking-[-0.045em]">
                {category.name}
              </h1>
              <p className="mt-5 max-w-lg text-[0.92rem] leading-relaxed text-white/50">
                {category.description}
              </p>
            </div>
            <div className="relative -mx-5 min-h-[260px] overflow-hidden sm:mx-0 sm:min-h-[330px] lg:min-h-[440px]">
              <Image
                src={category.image}
                alt={category.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-forest/55 via-transparent to-transparent lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container-page grid gap-8 py-10 sm:py-14 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
          <CatalogFilters
            categories={categories}
            values={values}
            basePath={`/category/${slug}`}
            showCategories={false}
          />

          <div className="min-w-0">
            <div className="mb-5 flex items-start gap-2.5 border border-line bg-light/70 px-3.5 py-3 text-[0.68rem] leading-relaxed text-forest/60">
              <Info className="mt-0.5 size-3.5 shrink-0 text-forest/45" />
              <p>
                This category is part of the OMNEXA demo catalogue. Product
                imagery and pricing are stand-in preview data.
              </p>
            </div>

            <CatalogToolbar
              values={values}
              basePath={`/category/${slug}`}
              total={result.total}
              label={result.total === 1 ? "product" : "products"}
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
                  basePath={`/category/${slug}`}
                  values={values}
                />
              </>
            ) : (
              <div className="flex flex-col items-center border border-line bg-white px-6 py-20 text-center">
                <h2 className="font-display text-3xl">
                  Nothing here with those filters.
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                  Clear the filters to see every piece in this category.
                </p>
                <Link
                  href={`/category/${slug}`}
                  className="btn btn-forest mt-6"
                >
                  <RotateCcw className="size-3.5" /> Clear filters
                </Link>
              </div>
            )}

            <div className="mt-12 border-t border-line pt-6">
              <p className="eyebrow text-forest/45">Keep exploring</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {otherCategories.map((item) => (
                  <Link
                    key={item.id}
                    href={`/category/${item.slug}`}
                    className="tag bg-white py-2 transition hover:border-forest hover:text-forest"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/categories"
                  className="tag bg-white py-2 transition hover:border-forest hover:text-forest"
                >
                  All categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
