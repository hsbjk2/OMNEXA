"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { PRICE_FILTERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

export type FilterValues = {
  q: string;
  category: string;
  sort: string;
  price: string;
  stock: string;
};

export function CatalogFilters({
  categories,
  values,
  basePath,
  showCategories = true,
}: {
  categories: Category[];
  values: FilterValues;
  basePath: string;
  showCategories?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = [
    values.category,
    values.price,
    values.stock === "in-stock" ? "stock" : "",
    values.q,
  ].filter(Boolean).length;

  function pushWith(update: Partial<FilterValues>) {
    const next = { ...values, ...update };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.category) params.set("category", next.category);
    if (next.sort && next.sort !== "popular") params.set("sort", next.sort);
    if (next.price) params.set("price", next.price);
    if (next.stock) params.set("stock", next.stock);
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${basePath}?${query}` : basePath);
      setMobileOpen(false);
    });
  }

  function clearAll() {
    startTransition(() => {
      router.push(basePath);
      setMobileOpen(false);
    });
  }

  const content = (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-forest/60" strokeWidth={1.5} />
          <p className="eyebrow text-forest/65">Filter</p>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-forest/45 underline underline-offset-4 transition hover:text-forest"
          >
            Clear all
          </button>
        )}
      </div>

      {showCategories && (
        <div className="mt-6 border-t border-line pt-5">
          <p className="text-[0.64rem] font-bold uppercase tracking-[0.15em] text-forest/55">
            Category
          </p>
          <div className="mt-3 space-y-1" role="radiogroup" aria-label="Category">
            <button
              type="button"
              role="radio"
              aria-checked={values.category === ""}
              onClick={() => pushWith({ category: "" })}
              className={cn(
                "flex w-full items-center justify-between py-1.5 text-left text-[0.8rem] transition",
                values.category === ""
                  ? "font-semibold text-forest"
                  : "text-ink/60 hover:text-forest",
              )}
            >
              <span>All pieces</span>
              {values.category === "" && <Check className="size-3.5" />}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                role="radio"
                aria-checked={values.category === category.slug}
                onClick={() => pushWith({ category: category.slug })}
                className={cn(
                  "flex w-full items-center justify-between gap-2 py-1.5 text-left text-[0.8rem] transition",
                  values.category === category.slug
                    ? "font-semibold text-forest"
                    : "text-ink/60 hover:text-forest",
                )}
              >
                <span className="flex items-center gap-2">
                  {category.name}
                  <span className="text-[0.62rem] font-normal text-muted/55">
                    {category.count}
                  </span>
                </span>
                {values.category === category.slug && (
                  <Check className="size-3.5 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-[0.64rem] font-bold uppercase tracking-[0.15em] text-forest/55">
          Price
        </p>
        <div className="mt-3 space-y-1" role="radiogroup" aria-label="Price">
          <button
            type="button"
            role="radio"
            aria-checked={values.price === ""}
            onClick={() => pushWith({ price: "" })}
            className={cn(
              "flex w-full items-center justify-between py-1.5 text-left text-[0.8rem] transition",
              values.price === ""
                ? "font-semibold text-forest"
                : "text-ink/60 hover:text-forest",
            )}
          >
            Any price
            {values.price === "" && <Check className="size-3.5" />}
          </button>
          {PRICE_FILTERS.map((range) => (
            <button
              key={range.value}
              type="button"
              role="radio"
              aria-checked={values.price === range.value}
              onClick={() => pushWith({ price: range.value })}
              className={cn(
                "flex w-full items-center justify-between py-1.5 text-left text-[0.8rem] transition",
                values.price === range.value
                  ? "font-semibold text-forest"
                  : "text-ink/60 hover:text-forest",
              )}
            >
              {range.label}
              {values.price === range.value && <Check className="size-3.5" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-[0.64rem] font-bold uppercase tracking-[0.15em] text-forest/55">
          Availability
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={values.stock === "in-stock"}
          onClick={() =>
            pushWith({ stock: values.stock === "in-stock" ? "" : "in-stock" })
          }
          className="mt-3 flex w-full items-center justify-between text-left text-[0.8rem] text-ink/65"
        >
          In stock only
          <span
            className={cn(
              "flex h-5 w-9 items-center rounded-full border p-0.5 transition",
              values.stock === "in-stock"
                ? "border-forest bg-forest"
                : "border-line bg-white",
            )}
          >
            <span
              className={cn(
                "size-3.5 rounded-full transition",
                values.stock === "in-stock"
                  ? "translate-x-[15px] bg-lime"
                  : "translate-x-0 bg-forest/25",
              )}
            />
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setMobileOpen(false)}
        className="btn btn-forest mt-6 w-full lg:hidden"
      >
        Show results
      </button>
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between border border-line bg-white px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-forest"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5" /> Filters
            {activeCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-forest text-[0.5rem] text-white">
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn("size-4 transition", mobileOpen && "rotate-180")}
          />
        </button>
        {mobileOpen && (
          <div className="relative mt-2 border border-line bg-white p-5">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close filters"
              className="absolute right-3 top-3 text-forest/45"
            >
              <X className="size-4" />
            </button>
            {content}
          </div>
        )}
      </div>

      <aside className="sticky top-28 hidden lg:block">{content}</aside>
    </>
  );
}
