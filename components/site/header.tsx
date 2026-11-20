"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import {
  SearchDialog,
  type PopularProduct,
} from "@/components/site/search-dialog";
import { useStore } from "@/components/providers/store-provider";
import { NAV_LINKS } from "@/lib/constants";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  count: number;
};

export function Header({
  categories,
  popular = [],
}: {
  categories: Category[];
  popular?: PopularProduct[];
}) {
  const pathname = usePathname();
  const { user, cartCount, wishlistCount, openCart } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navLinks = NAV_LINKS.filter(
    (link) => !["Home", "Shop", "Categories"].includes(link.label),
  );

  return (
    <>
      <header
        className={`sticky top-0 z-[100] border-b border-forest/10 transition-all duration-300 ${
          scrolled
            ? "bg-soft/95 shadow-[0_10px_40px_-30px_rgba(5,44,25,0.5)] backdrop-blur-xl"
            : "bg-soft"
        }`}
      >
        <div className="container-page flex h-[72px] items-center justify-between gap-4 lg:h-[84px]">
          <div className="flex min-w-0 items-center gap-10">
            <BrandLogo className="shrink-0" />

            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-6 xl:gap-8 lg:flex"
            >
              <div className="group relative">
                <Link
                  href="/shop"
                  className="flex items-center gap-1 py-7 text-[0.69rem] font-semibold uppercase tracking-[0.14em] text-ink/75 transition hover:text-forest"
                >
                  Shop
                  <ChevronDown className="size-3 transition duration-200 group-hover:rotate-180" />
                </Link>
                <div className="invisible absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-0 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="grid grid-cols-[1.45fr_1fr] overflow-hidden border border-line bg-white shadow-[0_40px_80px_-45px_rgba(5,44,25,0.4)]">
                    <div className="grid grid-cols-2 gap-x-4 p-6">
                      {categories.map((category, index) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          className="group/item flex items-start gap-2.5 border-b border-line/70 py-3 last:border-0"
                        >
                          <span className="mt-0.5 text-[0.55rem] font-bold tracking-wider text-forest/25">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[0.82rem] font-medium leading-snug text-ink/80 transition group-hover/item:text-forest">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="relative flex flex-col justify-end overflow-hidden bg-forest p-6 text-white">
                      <span className="absolute -right-8 -top-10 size-36 rounded-full border border-lime/15" />
                      <span className="eyebrow relative text-lime">The full edit</span>
                      <p className="relative mt-3 font-display text-[1.75rem] leading-[1.05]">
                        Everything,
                        <br />
                        in one place.
                      </p>
                      <Link
                        href="/shop"
                        className="relative mt-5 inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white transition hover:text-lime"
                      >
                        Shop all <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/categories"
                className="py-7 text-[0.69rem] font-semibold uppercase tracking-[0.14em] text-ink/75 transition hover:text-forest"
              >
                Categories
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-7 text-[0.69rem] font-semibold uppercase tracking-[0.14em] text-ink/75 transition hover:text-forest"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              aria-keyshortcuts="Control+K Meta+K"
              className="mr-1 hidden h-10 w-[188px] items-center gap-2.5 border border-forest/15 bg-white/60 px-3 text-left transition hover:border-forest/30 hover:bg-white 2xl:w-[236px] xl:flex"
            >
              <Search className="size-4 shrink-0 text-forest/40" strokeWidth={1.6} />
              <span className="flex-1 truncate text-[0.72rem] text-forest/40">
                Search products…
              </span>
              <kbd className="flex h-5 shrink-0 items-center border border-forest/10 bg-soft px-1.5 font-sans text-[0.52rem] font-semibold tracking-[0.06em] text-forest/35">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              aria-label="Search products"
              onClick={() => setSearchOpen(true)}
              className="flex size-10 items-center justify-center text-forest/75 transition hover:text-forest xl:hidden"
            >
              <Search className="size-[18px]" strokeWidth={1.6} />
            </button>

            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "Your account" : "Sign in"}
              className="relative hidden size-10 items-center justify-center text-forest/75 transition hover:text-forest sm:flex"
            >
              <UserRound className="size-[18px]" strokeWidth={1.6} />
              {user && (
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-bright" />
              )}
            </Link>

            <Link
              href="/wishlist"
              aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
              className="relative flex size-10 items-center justify-center text-forest/75 transition hover:text-forest"
            >
              <Heart className="size-[18px]" strokeWidth={1.6} />
              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-forest px-1 py-px text-[0.52rem] font-bold leading-tight text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label={`Shopping bag${cartCount ? `, ${cartCount} items` : ""}`}
              onClick={openCart}
              className="relative flex size-10 items-center justify-center text-forest/75 transition hover:text-forest"
            >
              <ShoppingBag className="size-[18px]" strokeWidth={1.6} />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-lime px-1 py-px text-[0.52rem] font-bold leading-tight text-deep">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="ml-1 flex size-10 items-center justify-center text-forest lg:hidden"
            >
              <Menu className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        categories={categories}
        popular={popular}
      />

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[130] lg:hidden"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-deep/55 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-soft text-ink shadow-2xl"
            >
              <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-line px-5">
                <BrandLogo />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="flex size-10 items-center justify-center text-forest"
                >
                  <X className="size-5" strokeWidth={1.4} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-7">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                  className="mb-6 flex w-full items-center gap-3 border border-line bg-white px-4 py-3.5 text-left transition hover:border-forest/25"
                >
                  <Search className="size-4 shrink-0 text-forest/40" strokeWidth={1.6} />
                  <span className="flex-1 text-[0.82rem] text-muted/65">
                    Search products…
                  </span>
                  <ArrowRight className="size-3.5 text-forest/30" />
                </button>

                <nav aria-label="Mobile navigation" className="space-y-0.5">
                  {[
                    { label: "Shop all", href: "/shop" },
                    { label: "Categories", href: "/categories" },
                    { label: "New Arrivals", href: "/new-arrivals" },
                    { label: "Coming Soon", href: "/coming-soon" },
                    { label: "About Us", href: "/about" },
                    { label: "Contact", href: "/contact" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between border-b border-line/70 py-3.5 font-display text-2xl text-ink"
                    >
                      {link.label}
                      <ArrowRight className="size-4 text-forest/35" />
                    </Link>
                  ))}
                </nav>

                <div className="mt-8">
                  <p className="eyebrow text-forest/45">Shop by category</p>
                  <div className="mt-3 grid grid-cols-2 gap-x-4">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="border-b border-line/60 py-2.5 text-[0.8rem] text-ink/70"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-2">
                  <Link
                    href={user ? "/account" : "/login"}
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-forest w-full"
                  >
                    {user ? "My account" : "Sign in"}
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-outline w-full"
                  >
                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </Link>
                </div>

                <p className="mt-8 text-xs leading-relaxed text-muted">
                  Beauty, skincare, makeup, kits and jewellery — chosen for real
                  routines.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
