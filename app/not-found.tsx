import Link from "next/link";
import { ArrowRight, Home, Search } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { POLICY_LINKS } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-soft">
      <header className="container-page flex items-center justify-between py-5 sm:py-6">
        <BrandLogo />
        <Link
          href="/shop"
          className="hidden text-[0.62rem] font-bold uppercase tracking-[0.13em] text-forest/55 transition hover:text-forest sm:inline-flex"
        >
          Shop the collection
        </Link>
      </header>

      <main
        id="main"
        className="container-page flex flex-1 items-center py-12 sm:py-20"
      >
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="eyebrow text-forest/40">Error 404</p>
            <p
              aria-hidden
              className="mt-2 select-none font-display text-[clamp(7rem,21vw,15rem)] leading-[0.75] tracking-[-0.08em] text-forest"
            >
              4<span className="italic text-forest/25">0</span>4
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[0.98] tracking-[-0.035em]">
              This page slipped
              <br />
              <span className="italic text-forest/55">the edit.</span>
            </h1>
            <p className="mt-5 max-w-sm text-[0.88rem] leading-relaxed text-muted">
              The address may be mistyped, or the piece may have moved. The
              shelves are still open — start again from the collection.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-forest">
                Shop all <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/" className="btn btn-outline">
                <Home className="size-3.5" /> Home
              </Link>
            </div>
          </div>

          <div className="border border-line bg-white p-6 sm:p-8">
            <p className="eyebrow text-forest/40">Keep looking</p>
            <h2 className="mt-3 font-display text-[1.7rem] leading-tight">
              Search the cabinet.
            </h2>
            <form action="/search" method="get" className="mt-5" role="search">
              <label htmlFor="not-found-search" className="field-label">
                What are you looking for?
              </label>
              <div className="mt-2 flex">
                <input
                  id="not-found-search"
                  name="q"
                  type="search"
                  placeholder="Serum, lipstick, earrings…"
                  className="min-w-0 flex-1 border border-line bg-soft px-3.5 py-3 text-[0.82rem] text-ink outline-none transition focus:border-forest"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex w-12 shrink-0 items-center justify-center bg-forest text-lime transition hover:bg-deep"
                >
                  <Search className="size-4" />
                </button>
              </div>
            </form>

            <div className="mt-7 border-t border-line pt-5">
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.13em] text-forest/40">
                Helpful pages
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  { label: "Categories", href: "/categories" },
                  { label: "New arrivals", href: "/new-arrivals" },
                  { label: "Contact us", href: "/contact" },
                  { label: "Your account", href: "/account" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between border-b border-line py-2 text-[0.75rem] text-forest/70 transition hover:text-forest"
                  >
                    {link.label}
                    <ArrowRight className="size-3 text-forest/25" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-5 text-[0.6rem] uppercase tracking-[0.1em] text-forest/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} OMNEXA · Demonstration storefront</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {POLICY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-forest"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
