import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Info, Sparkles } from "lucide-react";
import { queryCatalog } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/product-grid";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "New arrivals",
  description:
    "The latest additions to the OMNEXA demo catalogue — new skincare, makeup, makeup kits, jewellery and accessories.",
  alternates: { canonical: "/new-arrivals" },
};

export default async function NewArrivalsPage() {
  const result = await queryCatalog(
    { sort: "newest", newArrivals: true },
    { perPage: 24 },
  );

  return (
    <>
      <section className="bg-cream">
        <div className="container-page grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="py-12 sm:py-16 lg:py-20 lg:pr-12">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.13em] text-forest/35"
            >
              <Link href="/" className="transition hover:text-forest">
                Home
              </Link>
              <ChevronRight className="size-3" />
              <span className="text-forest/65">New arrivals</span>
            </nav>
            <div className="mt-8 flex items-center gap-2 text-forest/55">
              <Sparkles className="size-4 text-bright" strokeWidth={1.6} />
              <p className="eyebrow">Just landed</p>
            </div>
            <h1 className="mt-4 max-w-xl font-display text-[clamp(2.9rem,5.8vw,5.2rem)] leading-[0.92] tracking-[-0.045em] text-ink">
              New to the shelf,
              <br />
              <span className="italic text-forest/65">ready for the ritual.</span>
            </h1>
            <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-muted">
              The latest additions across skincare, colour and jewellery. Small
              arrivals, chosen to sit naturally beside what you already love.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-forest">
                Shop all products <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/coming-soon" className="btn btn-outline">
                See what&apos;s next
              </Link>
            </div>
          </div>
          <div className="relative -mx-5 min-h-[310px] overflow-hidden sm:mx-0 lg:min-h-[480px]">
            <Image
              src="/images/editorial/editorial-still.webp"
              alt="A new-season still life of cosmetic pieces on soft fabric"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep/30 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 bg-deep/70 px-4 py-3 text-white backdrop-blur-sm">
              <p className="text-[0.5rem] font-semibold uppercase tracking-[0.17em] text-lime">
                The new edit
              </p>
              <p className="mt-1 font-display text-xl italic">Quietly in.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-forest/50">New arrivals</p>
              <h2 className="title-md mt-3">
                {result.total} recently added{" "}
                <span className="italic">pieces.</span>
              </h2>
            </div>
            <div className="flex items-start gap-2.5 border border-line bg-light/70 px-3 py-2.5 text-[0.66rem] leading-relaxed text-forest/55">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <p>Part of the clearly marked demo catalogue.</p>
            </div>
          </div>

          {result.products.length > 0 ? (
            <ProductGrid products={result.products} className="mt-8" />
          ) : (
            <div className="py-20 text-center">
              <h2 className="font-display text-3xl">The next edit is on its way.</h2>
              <p className="mt-2 text-sm text-muted">
                Join the newsletter and we&apos;ll let you know when it lands.
              </p>
              <Link href="/#newsletter" className="btn btn-forest mt-6">
                Join the list
              </Link>
            </div>
          )}

          <Reveal className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
            <p className="max-w-md text-sm leading-relaxed text-muted">
              Looking for something specific? Browse the full collection or
              filter by category.
            </p>
            <Link href="/categories" className="btn btn-outline">
              Browse categories <ArrowRight className="size-3.5" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
