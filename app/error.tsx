"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowRight, Home, RefreshCw } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the browser console for local diagnosis.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-soft">
      <header className="container-page flex items-center justify-between py-5 sm:py-6">
        <BrandLogo />
        <Link
          href="/contact"
          className="hidden text-[0.62rem] font-bold uppercase tracking-[0.13em] text-forest/55 transition hover:text-forest sm:inline-flex"
        >
          Contact the store
        </Link>
      </header>

      <main
        id="main"
        className="container-page flex flex-1 items-center py-12 sm:py-20"
      >
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="inline-flex size-12 items-center justify-center rounded-full border border-wine/20 bg-[#f7eaea] text-wine">
              <AlertTriangle className="size-5" strokeWidth={1.6} />
            </span>
            <p className="eyebrow mt-5 text-forest/40">Something went wrong</p>
            <h1 className="mt-3 font-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.04em]">
              A small snag.
              <br />
              <span className="italic text-forest/55">Nothing lost.</span>
            </h1>
            <p className="mt-5 max-w-md text-[0.9rem] leading-relaxed text-muted">
              This screen failed to load. Your bag and saved pieces are kept in
              your browser or account, so it is safe to try again.
            </p>
            {error.digest && (
              <p className="mt-4 text-[0.6rem] uppercase tracking-[0.12em] text-forest/35">
                Reference: {error.digest}
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => reset()} className="btn btn-forest">
                <RefreshCw className="size-3.5" /> Try again
              </button>
              <Link href="/" className="btn btn-outline">
                <Home className="size-3.5" /> Home
              </Link>
            </div>
          </div>

          <div className="border border-line bg-white p-6 sm:p-8">
            <p className="eyebrow text-forest/40">If it keeps happening</p>
            <h2 className="mt-3 font-display text-[1.7rem] leading-tight">
              We can still help.
            </h2>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
              Try the collection again, or send the store a note with the
              reference above. For an order, sign in to view its saved status
              and confirmation details.
            </p>
            <div className="mt-5 grid gap-2">
              {[
                { label: "Shop the collection", href: "/shop" },
                { label: "View your account", href: "/account" },
                { label: "Contact the store", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between border-b border-line py-2.5 text-[0.76rem] text-forest/70 transition hover:text-forest"
                >
                  {link.label}
                  <ArrowRight className="size-3 text-forest/25" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="container-page py-5 text-[0.6rem] uppercase tracking-[0.1em] text-forest/35">
          © {new Date().getFullYear()} OMNEXA · Demonstration storefront
        </div>
      </footer>
    </div>
  );
}
