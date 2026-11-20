"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Loader2,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { cn, formatPrice } from "@/lib/utils";

const QUICK_SEARCHES = ["Facial oil", "Lipstick", "Pearl", "Makeup kit"];

export type PopularProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  isDemo?: boolean;
};

type SuggestionProduct = PopularProduct & {
  status: string;
};

type Suggestion = {
  products: SuggestionProduct[];
  categories: Array<{ id: string; name: string; slug: string }>;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  count: number;
};

function Highlight({ text, term }: { text: string; term: string }) {
  if (!term) return <>{text}</>;
  const haystack = text.toLowerCase();
  const needle = term.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let match = haystack.indexOf(needle);
  let key = 0;

  while (match !== -1) {
    if (match > cursor) parts.push(text.slice(cursor, match));
    parts.push(
      <mark
        key={key++}
        className="bg-lime/25 text-inherit [text-decoration:none]"
      >
        {text.slice(match, match + term.length)}
      </mark>,
    );
    cursor = match + term.length;
    match = haystack.indexOf(needle, cursor);
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

function ProductRowContent({
  product,
  term,
}: {
  product: PopularProduct & { status?: string };
  term: string;
}) {
  return (
    <>
      <span className="relative block h-[70px] w-[56px] shrink-0 overflow-hidden bg-light">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="56px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-forest/45">
          <span className="truncate">{product.category}</span>
          {product.isDemo && (
            <span className="border border-forest/10 bg-cream px-1.5 py-px text-[0.5rem] font-bold tracking-[0.1em] text-forest/50">
              Demo
            </span>
          )}
        </span>
        <span className="mt-1 block truncate font-display text-lg leading-snug text-ink transition group-hover:text-forest">
          <Highlight text={product.name} term={term} />
        </span>
        <span className="mt-0.5 block text-[0.72rem] text-muted">
          {product.status === "COMING_SOON" ? "Coming soon" : formatPrice(product.price)}
        </span>
      </span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-forest/10 text-forest/35 transition duration-300 group-hover:border-forest group-hover:bg-forest group-hover:text-white">
        <ArrowUpRight className="size-3.5" />
      </span>
    </>
  );
}

export function SearchDialog({
  open,
  onClose,
  categories,
  popular = [],
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  popular?: PopularProduct[];
}) {
  const router = useRouter();
  const { searchHistory, addSearch, clearSearchHistory } = useStore();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const term = query.trim();
  const hasQuery = term.length >= 2;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSuggestions(null);
    setActiveIndex(-1);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    const original = document.body.style.overflow;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
      previousFocus?.focus({ preventScroll: true });
    };
    // onClose is a stable enough inline callback; re-running this effect on
    // every header render would reset the query while the panel is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || term.length < 2) {
      setSuggestions(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(term)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search unavailable");
        const data = (await response.json()) as Suggestion;
        setSuggestions(data);
      } catch {
        if (!controller.signal.aborted) setSuggestions({ products: [], categories: [] });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [term, open]);

  const flatItems = useMemo(() => {
    if (!hasQuery || !suggestions) return [] as Array<{ href: string }>;
    const items: Array<{ href: string }> = suggestions.products.map((product) => ({
      href: `/product/${product.slug}`,
    }));
    for (const category of suggestions.categories) {
      items.push({ href: `/category/${category.slug}` });
    }
    if (suggestions.products.length > 0) {
      items.push({ href: `/search?q=${encodeURIComponent(term)}` });
    }
    return items;
  }, [hasQuery, suggestions, term]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [term, suggestions]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const element = document.getElementById(`search-option-${activeIndex}`);
    element?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const recordAndClose = useCallback(() => {
    if (term.length >= 2) addSearch(term);
    onClose();
  }, [term, addSearch, onClose]);

  const goTo = useCallback(
    (href: string) => {
      recordAndClose();
      router.push(href);
    },
    [recordAndClose, router],
  );

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!hasQuery) return;
    goTo(`/search?q=${encodeURIComponent(term)}`);
  };

  const clear = () => {
    setQuery("");
    setSuggestions(null);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && flatItems.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % flatItems.length);
      return;
    }
    if (event.key === "ArrowUp" && flatItems.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? flatItems.length - 1 : current - 1));
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0 && flatItems[activeIndex]) {
      event.preventDefault();
      goTo(flatItems[activeIndex].href);
    }
  };

  const resultsIndex = suggestions
    ? suggestions.products.length + suggestions.categories.length
    : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[125]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="absolute inset-0 bg-deep/65 backdrop-blur-sm"
          />

          <div className="pointer-events-none absolute inset-0 flex items-start justify-center sm:p-6">
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Search OMNEXA"
              initial={{ y: -22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-soft shadow-2xl sm:mt-[5vh] sm:h-auto sm:max-h-[84dvh] sm:max-w-3xl sm:border sm:border-white/25"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-line bg-white/60 px-5 py-3.5 sm:px-7">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-6 items-center justify-center bg-forest text-lime">
                    <Search className="size-3.5" strokeWidth={1.8} />
                  </span>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-forest/55">
                    Search the collection
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <kbd className="hidden h-6 items-center border border-forest/15 bg-white px-2 font-sans text-[0.55rem] font-semibold tracking-[0.08em] text-forest/45 sm:inline-flex">
                    ESC
                  </kbd>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close search"
                    className="flex size-9 items-center justify-center text-forest/55 transition hover:text-forest"
                  >
                    <X className="size-5" strokeWidth={1.4} />
                  </button>
                </div>
              </div>

              <div className="shrink-0 border-b border-line bg-soft px-5 pb-3.5 pt-4 sm:px-7 sm:pb-4 sm:pt-5">
                <form onSubmit={submit} role="search">
                  <div className="flex items-center gap-3 border border-forest/15 bg-white px-3.5 transition focus-within:border-forest/45 focus-within:shadow-[0_18px_40px_-32px_rgba(5,44,25,0.55)] sm:px-4">
                    <Search
                      className="size-[18px] shrink-0 text-forest/40"
                      strokeWidth={1.5}
                    />
                    <label htmlFor="omnexa-search" className="sr-only">
                      Search products
                    </label>
                    <input
                      ref={inputRef}
                      id="omnexa-search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={onInputKeyDown}
                      placeholder="Search skincare, lipstick…"
                      role="combobox"
                      aria-expanded={hasQuery && Boolean(suggestions)}
                      aria-controls="search-results"
                      aria-autocomplete="list"
                      aria-activedescendant={
                        activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
                      }
                      className="search-input h-14 w-full min-w-0 bg-transparent font-display text-xl text-ink outline-none placeholder:text-ink/25 sm:text-[1.55rem]"
                      autoComplete="off"
                      maxLength={80}
                    />
                    {query.length > 0 && (
                      <button
                        type="button"
                        onClick={clear}
                        aria-label="Clear search"
                        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-forest/[0.06] text-forest/45 transition hover:bg-forest/10 hover:text-forest"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                    {loading ? (
                      <Loader2 className="size-4 shrink-0 animate-spin text-forest/40" />
                    ) : (
                      <kbd className="hidden h-6 shrink-0 items-center border border-forest/15 bg-soft px-2 font-sans text-[0.6rem] font-semibold text-forest/45 sm:inline-flex">
                        ↵
                      </kbd>
                    )}
                  </div>
                </form>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p
                    className="min-h-[1rem] text-[0.61rem] tracking-[0.01em] text-muted/65"
                    aria-live="polite"
                  >
                    {loading && !suggestions
                      ? "Searching the collection…"
                      : term.length === 1
                        ? "One more character to begin."
                        : hasQuery && suggestions
                          ? `${suggestions.products.length} product ${
                              suggestions.products.length === 1 ? "match" : "matches"
                            } · press Enter for the full search`
                          : "Search by product, finish or category."}
                  </p>
                  <Link
                    href="/search"
                    onClick={onClose}
                    className="hidden shrink-0 items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-forest/45 transition hover:text-forest sm:inline-flex"
                  >
                    Advanced search <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </div>

              <div
                id="search-results"
                role={hasQuery ? "listbox" : undefined}
                aria-label={hasQuery ? "Search suggestions" : undefined}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6"
              >
                {!hasQuery ? (
                  <>
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="eyebrow text-forest/45">Recent searches</p>
                          {searchHistory.length > 0 && (
                            <button
                              type="button"
                              onClick={() => void clearSearchHistory()}
                              className="inline-flex items-center gap-1 text-[0.6rem] font-semibold text-forest/40 transition hover:text-forest"
                            >
                              <Trash2 className="size-3" /> Clear
                            </button>
                          )}
                        </div>
                        {searchHistory.length > 0 ? (
                          <ul className="mt-2.5">
                            {searchHistory.slice(0, 5).map((entry) => (
                              <li key={entry}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuery(entry);
                                    inputRef.current?.focus();
                                  }}
                                  className="group flex w-full items-center gap-2.5 py-2 text-left text-[0.82rem] text-ink/75 transition hover:text-forest"
                                >
                                  <Clock3 className="size-3.5 shrink-0 text-forest/25" />
                                  <span className="truncate">{entry}</span>
                                  <ArrowUpRight className="ml-auto size-3 shrink-0 text-forest/0 transition group-hover:text-forest/40" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2.5 text-[0.78rem] leading-relaxed text-muted">
                            Your recent searches will appear here.
                          </p>
                        )}

                        <p className="eyebrow mt-6 text-forest/45">Try searching</p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {QUICK_SEARCHES.map((entry) => (
                            <button
                              key={entry}
                              type="button"
                              onClick={() => {
                                setQuery(entry);
                                inputRef.current?.focus();
                              }}
                              className="tag py-1.5 transition hover:border-forest hover:text-forest"
                            >
                              {entry}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="eyebrow text-forest/45">Browse categories</p>
                        <div className="mt-2.5 grid gap-x-5 sm:grid-cols-2">
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/category/${category.slug}`}
                              onClick={onClose}
                              className="flex items-center justify-between gap-2 border-b border-line/60 py-2.5 text-[0.8rem] text-ink/75 transition hover:text-forest"
                            >
                              <span className="truncate">{category.name}</span>
                              <span className="shrink-0 text-[0.56rem] tabular-nums text-forest/30">
                                {category.count}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {popular.length > 0 && (
                      <div className="mt-8 border-t border-line pt-6">
                        <div className="flex items-center justify-between gap-3">
                          <p className="eyebrow flex items-center gap-1.5 text-forest/45">
                            <Sparkles className="size-3 text-bright" />
                            Popular right now
                          </p>
                          <span className="text-[0.53rem] font-semibold uppercase tracking-[0.12em] text-muted/45">
                            Demo catalogue
                          </span>
                        </div>
                        <ul className="mt-1.5 divide-y divide-line/70">
                          {popular.map((product) => (
                            <li key={product.id}>
                              <Link
                                href={`/product/${product.slug}`}
                                onClick={recordAndClose}
                                className="group flex items-center gap-4 py-3"
                              >
                                <ProductRowContent product={product} term="" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : loading && !suggestions ? (
                  <div className="space-y-4">
                    {[0, 1, 2, 3].map((item) => (
                      <div key={item} className="flex gap-4">
                        <div className="skeleton h-[70px] w-[56px] shrink-0" />
                        <div className="flex-1 space-y-2 pt-1.5">
                          <div className="skeleton h-2.5 w-1/4" />
                          <div className="skeleton h-3.5 w-2/3" />
                          <div className="skeleton h-2.5 w-1/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestions &&
                  (suggestions.products.length > 0 ||
                    suggestions.categories.length > 0) ? (
                  <>
                    {suggestions.products.length > 0 && (
                      <>
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="eyebrow text-forest/45">Top matches</p>
                          <span className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted/50">
                            {suggestions.products.length >= 6
                              ? "Showing 6"
                              : `${suggestions.products.length} found`}
                          </span>
                        </div>
                        <ul
                          className="mt-1.5 divide-y divide-line/70"
                          aria-label="Product matches"
                        >
                          {suggestions.products.map((product, index) => (
                            <li
                              key={product.id}
                              id={`search-option-${index}`}
                              role="option"
                              aria-selected={activeIndex === index}
                              onMouseEnter={() => setActiveIndex(index)}
                              className={cn(
                                "transition-colors",
                                activeIndex === index && "bg-light/60",
                              )}
                            >
                              <Link
                                href={`/product/${product.slug}`}
                                onClick={recordAndClose}
                                className="group flex items-center gap-4 px-2 py-3"
                              >
                                <ProductRowContent product={product} term={term} />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {suggestions.categories.length > 0 && (
                      <div className={suggestions.products.length > 0 ? "mt-6" : ""}>
                        <p className="eyebrow text-forest/45">Categories</p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {suggestions.categories.map((category, index) => {
                            const optionIndex = suggestions.products.length + index;
                            return (
                              <Link
                                key={category.id}
                                id={`search-option-${optionIndex}`}
                                role="option"
                                aria-selected={activeIndex === optionIndex}
                                href={`/category/${category.slug}`}
                                onClick={recordAndClose}
                                onMouseEnter={() => setActiveIndex(optionIndex)}
                                className={cn(
                                  "tag py-1.5 transition",
                                  activeIndex === optionIndex
                                    ? "border-forest bg-forest text-white"
                                    : "hover:border-forest hover:text-forest",
                                )}
                              >
                                <Highlight text={category.name} term={term} />
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {suggestions.products.length > 0 && (
                      <button
                        type="button"
                        id={`search-option-${resultsIndex}`}
                        role="option"
                        aria-selected={activeIndex === resultsIndex}
                        onClick={() => goTo(`/search?q=${encodeURIComponent(term)}`)}
                        onMouseEnter={() => setActiveIndex(resultsIndex)}
                        className={cn(
                          "group mt-6 flex w-full items-center justify-between gap-4 border border-forest/10 px-4 py-3 text-left transition",
                          activeIndex === resultsIndex
                            ? "border-forest/25 bg-light"
                            : "bg-forest/[0.03] hover:bg-light",
                        )}
                      >
                        <span>
                          <span className="block text-[0.55rem] font-bold uppercase tracking-[0.15em] text-forest/40">
                            Full collection search
                          </span>
                          <span className="mt-1 block font-display text-lg leading-snug text-ink">
                            See every result for “{term}”
                          </span>
                        </span>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-forest/15 text-forest/50 transition group-hover:border-forest group-hover:bg-forest group-hover:text-white">
                          <ArrowRight className="size-4" />
                        </span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-light text-forest">
                      <Search className="size-5" strokeWidth={1.4} />
                    </span>
                    <p className="mt-4 font-display text-2xl text-ink">
                      No quick matches for “{term}”.
                    </p>
                    <p className="mx-auto mt-1.5 max-w-sm text-[0.82rem] leading-relaxed text-muted">
                      Press Enter to search the full collection, or start from
                      one of the categories below.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {categories.slice(0, 4).map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          onClick={onClose}
                          className="tag py-1.5 transition hover:border-forest hover:text-forest"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => submit()}
                      className="btn btn-outline mt-6 h-10 px-5"
                    >
                      Search all products <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-4 border-t border-line bg-white/70 px-5 py-3 sm:px-7">
                <div className="hidden items-center gap-3 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted/55 md:flex">
                  <span className="flex items-center gap-1">
                    <kbd className="flex h-5 items-center border border-forest/15 bg-white px-1 text-[0.52rem] text-forest/45">
                      ↑
                    </kbd>
                    <kbd className="flex h-5 items-center border border-forest/15 bg-white px-1 text-[0.52rem] text-forest/45">
                      ↓
                    </kbd>
                    to move
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="flex h-5 items-center border border-forest/15 bg-white px-1 text-[0.52rem] text-forest/45">
                      ↵
                    </kbd>
                    to open
                  </span>
                </div>
                {hasQuery ? (
                  <button
                    type="button"
                    onClick={() => submit()}
                    className="ml-auto inline-flex items-center gap-2 text-[0.61rem] font-bold uppercase tracking-[0.14em] text-forest transition hover:text-bright"
                  >
                    View all results <ArrowRight className="size-3.5" />
                  </button>
                ) : (
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="ml-auto inline-flex items-center gap-2 text-[0.61rem] font-bold uppercase tracking-[0.14em] text-forest transition hover:text-bright"
                  >
                    Browse everything <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
