import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productCardInclude, toProductCard } from "@/lib/products";
import { WaitlistForm } from "@/components/product/waitlist-form";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Coming soon",
  description:
    "A first look at the next OMNEXA pieces. Join the notification list for launch news.",
  alternates: { canonical: "/coming-soon" },
};

export default async function ComingSoonPage() {
  const rows = await prisma.product.findMany({
    where: { isPublished: true, status: "COMING_SOON" },
    include: productCardInclude,
    orderBy: { createdAt: "desc" },
  });
  const products = rows.map(toProductCard);

  return (
    <>
      <section className="grain relative overflow-hidden bg-deep text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full bg-[radial-gradient(circle,rgba(168,217,22,0.14),transparent_68%)]" />
        <div className="container-page relative z-10 py-14 sm:py-20">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.13em] text-white/35"
          >
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-white/65">Coming soon</span>
          </nav>
          <div className="mt-8 grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="eyebrow text-lime">A first look</p>
              <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.9rem,6vw,5.5rem)] leading-[0.9] tracking-[-0.045em]">
                Before
                <br />
                <span className="italic text-lime">everyone else.</span>
              </h1>
            </div>
            <div>
              <p className="max-w-sm text-[0.9rem] leading-relaxed text-white/50">
                The next pieces are still in the making. These are previews,
                not products on sale — leave your email and we&apos;ll send one
                note when they arrive.
              </p>
              <div className="mt-5 flex items-start gap-2 border-t border-white/10 pt-4 text-[0.68rem] leading-relaxed text-white/30">
                <Info className="mt-0.5 size-3.5 shrink-0 text-lime/60" />
                <p>
                  Launch dates and prices are not announced yet, so no dates or
                  prices are shown.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container-page">
          {products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product, index) => (
                <Reveal key={product.id} delay={(index % 3) * 0.07}>
                  <article className="flex h-full flex-col border border-line bg-white">
                    <Link
                      href={`/product/${product.slug}`}
                      className="group relative block aspect-[4/5] overflow-hidden bg-light"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition duration-[1000ms] group-hover:scale-[1.035]"
                      />
                      <span className="absolute left-3 top-3 bg-forest px-2.5 py-1.5 text-[0.54rem] font-bold uppercase tracking-[0.14em] text-lime">
                        Coming soon
                      </span>
                    </Link>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-forest/45">
                        {product.category.name}
                      </p>
                      <h2 className="mt-2 font-display text-[1.75rem] leading-[1.08]">
                        <Link
                          href={`/product/${product.slug}`}
                          className="transition hover:text-forest"
                        >
                          {product.name}
                        </Link>
                      </h2>
                      <p className="mt-3 text-[0.83rem] leading-relaxed text-muted">
                        {product.description}
                      </p>
                      <div className="mt-auto border-t border-line pt-5">
                        <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-forest/55">
                          Get the arrival note
                        </p>
                        <WaitlistForm productId={product.id} tone="light" />
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <h2 className="font-display text-3xl">Nothing on the horizon yet.</h2>
              <p className="mt-2 text-sm text-muted">
                New launch previews will appear here.
              </p>
              <Link href="/shop" className="btn btn-forest mt-6">
                Shop what&apos;s available
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
