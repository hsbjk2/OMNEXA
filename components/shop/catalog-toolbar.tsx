"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/constants";
import type { FilterValues } from "@/components/shop/catalog-filters";

export function CatalogToolbar({
  values,
  basePath,
  total,
  label = "products",
  searchLabel = "Search the collection",
}: {
  values: FilterValues;
  basePath: string;
  total: number;
  label?: string;
  searchLabel?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function updateSort(sort: string) {
    const params = new URLSearchParams();
    if (values.q) params.set("q", values.q);
    if (values.category) params.set("category", values.category);
    if (sort !== "popular") params.set("sort", sort);
    if (values.price) params.set("price", values.price);
    if (values.stock) params.set("stock", values.stock);
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${basePath}?${query}` : basePath);
    });
  }

  return (
    <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.13em] text-muted">
        {total} {label}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form
          action={basePath}
          method="get"
          className="relative flex min-w-0 items-center border border-line bg-white"
        >
          <label htmlFor="catalog-search" className="sr-only">
            {searchLabel}
          </label>
          <Search className="ml-3 size-3.5 shrink-0 text-forest/40" />
          <input
            id="catalog-search"
            type="search"
            name="q"
            defaultValue={values.q}
            maxLength={80}
            placeholder="Search products"
            className="h-10 w-full min-w-0 bg-transparent px-2.5 text-[0.78rem] text-ink outline-none placeholder:text-muted/50 sm:w-40"
          />
          {values.category && <input type="hidden" name="category" value={values.category} />}
          {values.sort && values.sort !== "popular" && (
            <input type="hidden" name="sort" value={values.sort} />
          )}
          {values.price && <input type="hidden" name="price" value={values.price} />}
          {values.stock && <input type="hidden" name="stock" value={values.stock} />}
        </form>

        <div className="relative flex items-center border border-line bg-white">
          <label
            htmlFor="catalog-sort"
            className="pl-3 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted"
          >
            Sort
          </label>
          <select
            id="catalog-sort"
            value={values.sort || "popular"}
            onChange={(event) => updateSort(event.target.value)}
            disabled={pending}
            className="h-10 cursor-pointer bg-transparent py-0 pl-2 pr-8 text-[0.75rem] font-medium text-forest outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {pending && (
            <Loader2 className="absolute right-2 size-3.5 animate-spin text-forest/50" />
          )}
        </div>
      </div>
    </div>
  );
}
