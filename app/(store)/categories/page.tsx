import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { getCatalogCategories } from "@/lib/catalog";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse OMNEXA by category: skincare, makeup and cosmetics, artificial jewellery, makeup kits, beauty essentials and accessories.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCatalogCategories();

  return (
    <>
      <section className="bg-forest text-white">
        <div className="container-page py-12 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.13em] text-white/35"
          >
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-white/65">Categories</span>
          </nav>
          <div className="mt-7 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-lime">The cabinet</p>
              <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.7rem,5.5vw,4.8rem)] leading-[0.94] tracking-[-0.04em]">
                Every category,
                <br />
                <span className="italic text-lime">one considered place.</span>
              </h1>
            </div>
            <p className="max-w-[300px] text-[0.85rem] leading-relaxed text-white/45">
              Skin, colour, kits, jewellery and the finishing details — browse
              the edit by the ritual you are looking for.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container-page">
          <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Reveal key={category.id} delay={(index % 3) * 0.06}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-light">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep/35 via-transparent to-transparent opacity-60 transition group-hover:opacity-90" />
                    <span className="absolute left-4 top-4 bg-white/85 px-2.5 py-1.5 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-forest backdrop-blur-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-lime text-deep transition duration-300 group-hover:bg-white">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 pt-4">
                    <div>
                      <h2 className="font-display text-[1.65rem] leading-tight transition group-hover:text-forest">
                        {category.name}
                      </h2>
                      <p className="mt-1.5 max-w-sm text-[0.8rem] leading-relaxed text-muted">
                        {category.description}
                      </p>
                    </div>
                    <span className="shrink-0 pt-1.5 text-[0.6rem] uppercase tracking-[0.12em] text-forest/40">
                      {category.count} {category.count === 1 ? "piece" : "pieces"}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-line pt-8 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-display text-2xl">Not sure where to begin?</p>
              <p className="mt-1 text-sm text-muted">
                Start with the full collection or the latest additions.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="btn btn-forest">
                Shop all <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/new-arrivals" className="btn btn-outline">
                New arrivals
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
