import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Leaf,
  MapPin,
  MessageCircle,
  Navigation,
  PackageCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPublishedProductsForHome } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";
import { getShippingConfig } from "@/lib/shipping";
import { formatPrice, isValidHttpUrl } from "@/lib/utils";
import { Hero } from "@/components/home/hero";
import { ScrollScene } from "@/components/home/scroll-scene";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { WaitlistForm } from "@/components/product/waitlist-form";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { buildWhatsAppHref } from "@/lib/whatsapp";

export default async function HomePage() {
  const [home, categoryRows, settings, shipping] = await Promise.all([
    getPublishedProductsForHome(),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
    }),
    getSiteSettings(),
    Promise.resolve(getShippingConfig()),
  ]);

  const categories = categoryRows.map((category) => ({
    ...category,
    count: category._count.products,
  }));

  const marketplaceLinks = [
    {
      name: "Amazon",
      url: settings.amazonUrl,
      configured: isValidHttpUrl(settings.amazonUrl),
      note: "Our Amazon seller storefront",
    },
    {
      name: "Flipkart",
      url: settings.flipkartUrl,
      configured: isValidHttpUrl(settings.flipkartUrl),
      note: "Our Flipkart seller storefront",
    },
  ];

  const whatsappHref =
    buildWhatsAppHref(
      settings.whatsapp,
      "Hi OMNEXA! I would like to place an order and get further details.",
    ) ?? "";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OMNEXA",
    url: process.env.APP_URL || "http://localhost:3000",
    potentialAction: {
      "@type": "SearchAction",
      target: `${
        process.env.APP_URL || "http://localhost:3000"
      }/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Hero />

      {/* Categories */}
      <section className="section bg-soft">
        <div className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <p className="eyebrow text-forest/55">Find your ritual</p>
              <h2 className="title-lg mt-4 max-w-xl">
                Six ways into
                <br />
                <span className="italic text-forest/65">the everyday.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="sm:max-w-xs sm:text-right">
              <p className="text-[0.88rem] leading-relaxed text-muted">
                From slow skincare to the finishing jewellery — shop the
                categories that make up a considered routine.
              </p>
              <Link href="/categories" className="btn-quiet mt-4 inline-flex">
                All categories <ArrowRight className="size-3.5" />
              </Link>
            </Reveal>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {categories.map((category, index) => (
              <Reveal
                key={category.id}
                delay={Math.min((index % 3) * 0.08, 0.2)}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden bg-forest sm:aspect-[4/5]"
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/20 to-deep/5 transition duration-500 group-hover:from-deep/95" />
                  <div className="absolute inset-0 flex flex-col justify-between p-4 text-white sm:p-5 lg:p-6">
                    <div className="flex items-start justify-between">
                      <span className="text-[0.58rem] font-semibold tracking-[0.16em] text-white/45">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[0.55rem] uppercase tracking-[0.14em] text-white/40">
                        {category.count} {category.count === 1 ? "piece" : "pieces"}
                      </span>
                    </div>
                    <div>
                      <h3 className="max-w-[90%] font-display text-[1.45rem] leading-[1.04] tracking-[-0.02em] sm:text-[1.85rem] lg:text-[2.05rem]">
                        {category.name}
                      </h3>
                      <p className="mt-2 hidden max-w-[95%] text-[0.68rem] leading-relaxed text-white/50 sm:line-clamp-2 lg:text-[0.75rem]">
                        {category.description}
                      </p>
                      <span className="mt-3 flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.15em] text-lime">
                        Explore
                        <span className="flex size-6 items-center justify-center rounded-full border border-lime/35 transition duration-300 group-hover:bg-lime group-hover:text-deep">
                          <ArrowUpRight className="size-3" />
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Business highlights */}
      <section className="border-y border-line bg-white">
        <div className="container-page grid sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: PackageCheck,
              title: "Retail & wholesale",
              body: "Single orders and business enquiries, side by side.",
              href: "/wholesale",
              link: "Wholesale enquiries",
            },
            {
              icon: MessageCircle,
              title: "Order on WhatsApp",
              body: "Send your bag to the seller and arrange payment in chat.",
              href: "/policies/shipping",
              link: "How ordering works",
            },
            {
              icon: Truck,
              title: "Shipping, made clear",
              body: `Flat ${formatPrice(shipping.rate)} — complimentary above ${formatPrice(
                shipping.threshold,
              )}.`,
              href: "/policies/shipping",
              link: "Shipping policy",
            },
            {
              icon: Sparkles,
              title: "Questions, answered",
              body: "Write to our team through the contact form.",
              href: "/contact",
              link: "Contact us",
            },
          ].map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 0.05}
              className="border-b border-line py-7 sm:odd:border-r lg:border-b-0 lg:border-r lg:px-7 lg:py-9 lg:last:border-r-0 lg:first:pl-0"
            >
              <item.icon
                className="size-5 text-forest/65"
                strokeWidth={1.3}
              />
              <h3 className="mt-4 font-display text-[1.3rem] leading-tight">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted">
                {item.body}
              </p>
              <Link
                href={item.href}
                className="mt-3 inline-flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-forest/55 transition hover:text-forest"
              >
                {item.link} <ArrowRight className="size-3" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="section bg-soft">
        <div className="container-page">
          <SectionHeading
            eyebrow="Best sellers"
            title={
              <>
                The pieces you
                <br />
                <span className="italic">come back to.</span>
              </>
            }
            description="Everyday favourites from across the cabinet — skin, colour and jewellery chosen for repeat wear."
            href="/shop?sort=popular"
            linkLabel="Shop best sellers"
          />
          {home.bestSellers.length > 0 ? (
            <ProductGrid products={home.bestSellers} className="mt-10 sm:mt-12" />
          ) : (
            <p className="mt-10 text-sm text-muted">
              The best-seller edit is being prepared.{" "}
              <Link href="/shop" className="underline underline-offset-4">
                Browse the full collection
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <ScrollScene />

      {/* New arrivals */}
      <section className="section bg-cream">
        <div className="container-page">
          <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <Reveal className="relative lg:sticky lg:top-28">
              <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                <Image
                  src="/images/editorial/editorial-still.webp"
                  alt="A quiet still life of cosmetic packaging on soft fabric"
                  fill
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/50 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                  <p className="eyebrow text-lime">Just arrived</p>
                  <p className="mt-3 max-w-xs font-display text-[1.9rem] leading-[1.08] sm:text-[2.3rem]">
                    The new edit,
                    <br />
                    <span className="italic">quietly in.</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-b border-forest/15 pb-3 text-[0.64rem] uppercase tracking-[0.14em] text-forest/55">
                <span>New arrivals · Demo catalogue</span>
                <Link
                  href="/new-arrivals"
                  className="font-bold text-forest transition hover:text-bright"
                >
                  View all
                </Link>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <p className="eyebrow text-forest/55">New arrivals</p>
                <h2 className="title-lg mt-4 max-w-xl">
                  New to the shelf,
                  <br />
                  <span className="italic">ready for the ritual.</span>
                </h2>
                <p className="mt-4 max-w-lg text-[0.9rem] leading-relaxed text-muted">
                  Fresh additions across skincare, colour and jewellery. Each
                  piece has been added to the demo catalogue for this
                  storefront preview.
                </p>
              </Reveal>
              {home.newArrivals.length > 0 ? (
                <ProductGrid
                  products={home.newArrivals}
                  className="mt-8 lg:grid-cols-2"
                />
              ) : (
                <p className="mt-8 text-sm text-muted">
                  New arrivals will appear here soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="section bg-soft">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative ml-auto aspect-[4/5] w-[88%] overflow-hidden bg-light sm:w-[76%] lg:w-full">
              <Image
                src="/images/editorial/about-ritual.webp"
                alt="A quiet beauty ritual with a facial roller"
                fill
                sizes="(max-width: 1024px) 80vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-0 max-w-[260px] bg-forest p-5 text-white sm:left-6 sm:p-6">
              <Sparkles className="size-4 text-lime" strokeWidth={1.5} />
              <p className="mt-3 font-display text-[1.4rem] leading-[1.12]">
                Not more.
                <br />
                <span className="italic text-lime">Better chosen.</span>
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="order-1 lg:order-2">
            <p className="eyebrow text-forest/55">The OMNEXA idea</p>
            <h2 className="title-lg mt-4">
              A cabinet,
              <br />
              <span className="italic text-forest/70">considered.</span>
            </h2>
            <div className="prose-editorial mt-6 max-w-lg">
              <p>
                OMNEXA brings skincare, makeup, kits and artificial jewellery
                together under one quiet roof. The aim is simple: fewer, better
                choices — pieces that earn their space on the shelf and in the
                routine.
              </p>
              <p>
                We look for formulas that feel good to use, colours you will
                reach for and jewellery made for repeat wear. Retail and
                wholesale, with the same considered edit.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-5">
              <Link href="/about" className="btn btn-forest">
                Read our story <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/wholesale" className="btn-quiet">
                Wholesale enquiries <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-2 border-t border-line pt-5 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-forest/45">
              <span className="inline-flex items-center gap-2">
                <Leaf className="size-3.5 text-bright" /> Considered formulas
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="size-3.5 text-bright" /> Real routines
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Visit the store */}
      {settings.hasLocation && (
        <section className="relative overflow-hidden bg-cream">
          <div className="section container-page">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-16">
              <Reveal>
                <p className="eyebrow text-forest/55">Visit the store</p>
                <h2 className="title-lg mt-4">
                  Find us in Sirsa.
                  <br />
                  <span className="italic text-forest/65">In person.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.08} className="max-w-xl lg:justify-self-end">
                <p className="text-[0.9rem] leading-relaxed text-muted">
                  The full edit, on the shelf — skincare, colour, kits and
                  jewellery. Come by the store, or message us on WhatsApp to
                  place an order and ask for further details.
                </p>
                <p className="mt-3 flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-forest/45">
                  <MapPin className="size-3.5 text-bright" />
                  Google Business Profile · OMNEXA ENTERPRISE
                </p>
              </Reveal>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-[1.22fr_0.78fr]">
              <Reveal className="relative min-h-[360px] overflow-hidden border border-forest/10 bg-white sm:min-h-[440px] lg:min-h-[540px]">
                {settings.mapEmbedUrl ? (
                  <>
                    <iframe
                      src={settings.mapEmbedUrl}
                      title={`Google map to OMNEXA ENTERPRISE, ${settings.fullAddress}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 h-full w-full"
                    />
                    <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 border border-forest/10 bg-white/95 px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-forest shadow-sm backdrop-blur-sm">
                      <span className="size-1.5 rounded-full bg-bright" />
                      OMNEXA ENTERPRISE · Sirsa
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-[360px] flex-col items-center justify-center p-8 text-center">
                    <MapPin className="size-6 text-forest/30" strokeWidth={1.3} />
                    <p className="mt-4 max-w-xs text-[0.82rem] leading-relaxed text-muted">
                      The verified store address is published below. A Google
                      map embed appears here once its embed URL is saved in
                      admin settings.
                    </p>
                  </div>
                )}
              </Reveal>

              <Reveal
                delay={0.1}
                className="flex flex-col justify-between bg-deep p-6 text-white sm:p-8 lg:p-10"
              >
                <div>
                  <p className="eyebrow text-lime">OMNEXA ENTERPRISE</p>
                  <address className="mt-5 not-italic">
                    <span className="block font-display text-[1.65rem] leading-[1.28] text-white sm:text-[1.9rem]">
                      {settings.addressLine1}
                    </span>
                    <span className="mt-2 block text-[0.86rem] leading-relaxed text-white/50">
                      {[settings.addressLine2, settings.city, settings.state, settings.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </address>

                  <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-[0.7rem] leading-relaxed text-white/45">
                    <p className="flex items-center gap-2.5">
                      <Check className="size-3.5 text-lime/70" />
                      Retail &amp; wholesale
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Check className="size-3.5 text-lime/70" />
                      Orders confirmed on WhatsApp
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn btn-lime w-full justify-center"
                    >
                      <WhatsAppIcon className="size-4" />
                      Order on WhatsApp
                    </a>
                  )}
                  {whatsappHref && (
                    <p className="text-center text-[0.66rem] tracking-[0.02em] text-white/35">
                      {settings.whatsapp}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {settings.mapLink && (
                      <a
                        href={settings.mapLink}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex flex-1 items-center justify-center gap-2 border border-white/15 px-3 py-2.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white/70 transition hover:border-lime/60 hover:text-lime"
                      >
                        <Navigation className="size-3.5" /> Directions
                      </a>
                    )}
                    {settings.googleBusinessUrl && (
                      <a
                        href={settings.googleBusinessUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex flex-1 items-center justify-center gap-2 border border-white/15 px-3 py-2.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white/70 transition hover:border-lime/60 hover:text-lime"
                      >
                        <MapPin className="size-3.5" /> Google listing
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* Coming soon */}
      <section className="grain relative overflow-hidden bg-deep py-20 text-white sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(168,217,22,0.12),transparent_65%)]" />
        <div className="container-page relative z-10">
          <Reveal>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow text-lime">Coming soon</p>
                <h2 className="title-lg mt-4">
                  Before
                  <br />
                  <span className="italic text-white/55">everyone else.</span>
                </h2>
              </div>
              <p className="max-w-xs text-[0.85rem] leading-relaxed text-white/45">
                A first look at pieces still in the making. Leave your email
                and we&apos;ll write once — when they are ready.
              </p>
            </div>
          </Reveal>

          {home.comingSoon.length > 0 && (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {home.comingSoon.map((product, index) => (
                <Reveal key={product.id} delay={index * 0.08}>
                  <article className="group flex h-full flex-col border border-white/10 bg-white/[0.035]">
                    <Link
                      href={`/product/${product.slug}`}
                      className="relative block aspect-[4/5] overflow-hidden bg-white/5"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover opacity-90 transition duration-[900ms] group-hover:scale-[1.03] group-hover:opacity-100"
                      />
                      <span className="absolute left-3 top-3 rounded-[1px] bg-deep/80 px-2 py-1 text-[0.54rem] font-bold uppercase tracking-[0.14em] text-lime backdrop-blur-sm">
                        Coming soon
                      </span>
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-lime/55">
                        {product.category.name}
                      </p>
                      <h3 className="mt-2 font-display text-[1.5rem] leading-[1.1] text-white">
                        <Link
                          href={`/product/${product.slug}`}
                          className="transition hover:text-lime"
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <p className="mt-2 line-clamp-2 text-[0.78rem] leading-relaxed text-white/40">
                        {product.description}
                      </p>
                      <div className="mt-5 border-t border-white/10 pt-4">
                        <WaitlistForm productId={product.id} />
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/coming-soon"
              className="inline-flex items-center gap-2 text-[0.64rem] font-bold uppercase tracking-[0.15em] text-white/50 transition hover:text-lime"
            >
              See everything coming soon <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="section bg-light">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="eyebrow text-forest/55">Beyond the site</p>
            <h2 className="title-lg mt-4">
              Find us on
              <br />
              <span className="italic text-forest/70">your favourite shelves.</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.9rem] leading-relaxed text-muted">
              OMNEXA is built for retail and wholesale. Our marketplace
              storefronts are being finalised — the full collection is available
              to order right here in the meantime.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/shop" className="btn btn-forest">
                Shop the collection <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/contact" className="btn-quiet">
                Marketplace enquiries <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {marketplaceLinks.map((marketplace, index) => (
              <Reveal key={marketplace.name} delay={index * 0.08}>
                <div className="flex h-full min-h-[230px] flex-col justify-between border border-forest/12 bg-soft p-6">
                  <div className="flex items-start justify-between">
                    <span className="font-display text-[1.7rem] tracking-tight text-forest">
                      {marketplace.name}
                    </span>
                    {marketplace.configured ? (
                      <span className="flex size-8 items-center justify-center rounded-full bg-lime text-deep">
                        <ArrowUpRight className="size-3.5" />
                      </span>
                    ) : (
                      <span className="tag bg-white">Soon</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[0.8rem] leading-relaxed text-muted">
                      {marketplace.configured
                        ? marketplace.note
                        : "This marketplace storefront is being finalised. No seller link has been published yet."}
                    </p>
                    {marketplace.configured ? (
                      <a
                        href={marketplace.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-4 inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-forest transition hover:text-bright"
                      >
                        Visit {marketplace.name} <ArrowUpRight className="size-3" />
                      </a>
                    ) : (
                      <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-forest/35">
                        Link not configured
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative overflow-hidden bg-lime">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -right-32 -top-40 size-[540px] rounded-full border border-forest/15" />
          <div className="absolute -right-10 top-0 size-[280px] rounded-full border border-forest/10" />
          <div className="absolute -bottom-32 left-1/3 size-[360px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35),transparent_65%)]" />
        </div>
        <div className="container-page relative z-10 grid gap-8 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20">
          <Reveal>
            <p className="eyebrow text-forest/55">The OMNEXA letter</p>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,6vw,5rem)] leading-[0.92] tracking-[-0.04em] text-forest">
              A quieter
              <br />
              <span className="italic">kind of inbox.</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.9rem] leading-relaxed text-forest/65">
              New arrivals, considered edits and the occasional restock note.
              Nothing more than that.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <NewsletterForm tone="lime" />
          </Reveal>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
