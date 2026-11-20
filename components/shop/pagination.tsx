import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { FilterValues } from "@/components/shop/catalog-filters";
import { cn } from "@/lib/utils";

function pageHref(
  basePath: string,
  values: FilterValues,
  page: number,
) {
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.category) params.set("category", values.category);
  if (values.sort && values.sort !== "popular") params.set("sort", values.sort);
  if (values.price) params.set("price", values.price);
  if (values.stock) params.set("stock", values.stock);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function pageWindow(page: number, pageCount: number) {
  const pages = new Set<number>([1, pageCount, page]);
  for (let offset = 1; offset <= 2; offset += 1) {
    if (page - offset > 1) pages.add(page - offset);
    if (page + offset < pageCount) pages.add(page + offset);
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export function Pagination({
  page,
  pageCount,
  basePath,
  values,
  buildHref,
}: {
  page: number;
  pageCount: number;
  basePath?: string;
  values?: FilterValues;
  buildHref?: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  const pages = pageWindow(page, pageCount);
  const filterValues: FilterValues = values ?? {
    q: "",
    category: "",
    sort: "popular",
    price: "",
    stock: "",
  };
  const hrefFor = (target: number) =>
    buildHref
      ? buildHref(target)
      : pageHref(basePath ?? "/shop", filterValues, target);

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex flex-col items-center gap-4 border-t border-line pt-7 sm:flex-row sm:justify-between"
    >
      <p className="text-[0.68rem] uppercase tracking-[0.13em] text-muted">
        Page {page} of {pageCount}
      </p>
      <div className="flex items-center gap-1.5">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
            aria-label="Previous page"
            className="flex size-9 items-center justify-center border border-line bg-white text-forest transition hover:border-forest"
          >
            <ArrowLeft className="size-3.5" />
          </Link>
        ) : (
          <span className="flex size-9 items-center justify-center border border-line bg-white text-forest/20">
            <ArrowLeft className="size-3.5" />
          </span>
        )}

        {pages.map((number, index) => {
          const previous = pages[index - 1];
          const showGap = previous !== undefined && number - previous > 1;
          return (
            <span key={number} className="flex items-center gap-1.5">
              {showGap && <span className="px-1 text-muted/50">…</span>}
              <Link
                href={hrefFor(number)}
                aria-current={number === page ? "page" : undefined}
                className={cn(
                  "flex size-9 items-center justify-center border text-[0.72rem] font-semibold transition",
                  number === page
                    ? "border-forest bg-forest text-white"
                    : "border-line bg-white text-forest/65 hover:border-forest",
                )}
              >
                {number}
              </Link>
            </span>
          );
        })}

        {page < pageCount ? (
          <Link
            href={hrefFor(page + 1)}
            aria-label="Next page"
            className="flex size-9 items-center justify-center border border-line bg-white text-forest transition hover:border-forest"
          >
            <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          <span className="flex size-9 items-center justify-center border border-line bg-white text-forest/20">
            <ArrowRight className="size-3.5" />
          </span>
        )}
      </div>
    </nav>
  );
}
