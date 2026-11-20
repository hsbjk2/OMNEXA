import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  productCardInclude,
  toProductCard,
  toProductDetail,
} from "@/lib/products";
import { getRelatedProducts } from "@/lib/catalog";
import { getShippingConfig } from "@/lib/shipping";
import { absoluteUrl, formatPrice } from "@/lib/utils";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductGrid } from "@/components/product/product-grid";
import { RecentlyViewedRail } from "@/components/product/recently-viewed-rail";
import { ViewRecorder } from "@/components/product/view-recorder";

type Params = Promise<{ slug: string }>;

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: productCardInclude,
  });
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };

  const image = JSON.parse(product.images || "[]")[0] as string | undefined;

  return {
    title: product.name,
    description: `${product.description.slice(0, 155)}`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} | OMNEXA`,
      description: product.description.slice(0, 200),
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const row = await getProduct(slug);
  if (!row) notFound();

  const product = toProductDetail(row);
  const related = await getRelatedProducts(row.categoryId, row.id, 4);
  const shipping = getShippingConfig();
  const details = (product.details || "")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((image) => absoluteUrl(image)),
    category: product.category.name,
    brand: { "@type": "Brand", name: "OMNEXA" },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Catalogue status",
        value: product.isDemo ? "Demo catalogue item" : "Catalogue item",
      },
    ],
    ...(product.price > 0 && product.status !== "COMING_SOON"
      ? {
          offers: {
            "@type": "Offer",
            url: absoluteUrl(`/product/${product.slug}`),
            priceCurrency: "INR",
            price: product.price,
            itemCondition: "https://schema.org/NewCondition",
            availability:
              product.status === "AVAILABLE" && product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        }
      : {}),
  };

  return (
    <>
      <div className="border-b border-line bg-soft">
        <div className="container-page flex flex-wrap items-center gap-1.5 py-5 text-[0.62rem] uppercase tracking-[0.13em] text-muted/60">
          <Link href="/" className="transition hover:text-forest">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link href="/shop" className="transition hover:text-forest">
            Shop
          </Link>
          <ChevronRight className="size-3" />
          <Link
            href={`/category/${product.category.slug}`}
            className="transition hover:text-forest"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="size-3" />
          <span className="max-w-[220px] truncate text-forest/65">
            {product.name}
          </span>
        </div>
      </div>

      <section className="bg-soft">
        <div className="container-page grid gap-10 py-8 sm:py-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 xl:gap-20">
          <div>
            <ProductGallery
              images={product.images}
              name={product.name}
              isDemo={product.isDemo}
            />
          </div>

          <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/category/${product.category.slug}`}
                className="eyebrow text-forest/55 transition hover:text-forest"
              >
                {product.category.name}
              </Link>
              <span className="text-forest/20">/</span>
              <span className="text-[0.58rem] uppercase tracking-[0.13em] text-muted/55">
                SKU {product.sku}
              </span>
            </div>

            <h1 className="mt-4 font-display text-[clamp(2.45rem,4.8vw,4.2rem)] leading-[0.96] tracking-[-0.04em] text-ink">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
              {product.status === "COMING_SOON" ? (
                <span className="font-display text-2xl text-forest">
                  Launching soon
                </span>
              ) : (
                <>
                  <span className="font-display text-[1.8rem] leading-none text-forest">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="text-[0.82rem] text-muted/60">
                        MRP{" "}
                        <span className="line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      </span>
                    )}
                </>
              )}
              {product.isBestSeller && (
                <span className="tag tag-lime ml-auto">Best seller</span>
              )}
              {product.isNewArrival && (
                <span className="tag tag-lime ml-auto">New in</span>
              )}
            </div>

            <p className="mt-5 max-w-xl text-[0.92rem] leading-[1.8] text-muted">
              {product.description}
            </p>

            {product.isDemo && (
              <div className="mt-4 border border-line bg-light/70 px-3.5 py-2.5 text-[0.68rem] leading-relaxed text-forest/55">
                Demo catalogue item — product details, pricing and imagery are
                stand-in data for this storefront preview.
              </div>
            )}

            <ProductPurchase product={product} />

            <div className="mt-7 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
              <div className="flex items-start gap-2.5 text-[0.72rem] leading-relaxed text-muted">
                <Truck className="mt-0.5 size-4 shrink-0 text-forest/50" strokeWidth={1.4} />
                <p>
                  Flat {formatPrice(shipping.rate)} delivery. Complimentary
                  above {formatPrice(shipping.threshold)}.
                </p>
              </div>
              <div className="flex items-start gap-2.5 text-[0.72rem] leading-relaxed text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest/50" strokeWidth={1.4} />
                <p>
                  Cash on delivery. Secure checkout with server-verified
                  pricing.
                </p>
              </div>
            </div>

            <div className="mt-6">
              {details.length > 0 && (
                <details className="group border-t border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-forest/70">
                    The details
                    <span className="text-forest/40 transition group-open:rotate-45">
                      <Plus className="size-4" strokeWidth={1.5} />
                    </span>
                  </summary>
                  <ul className="space-y-2 pb-5 text-[0.82rem] leading-relaxed text-muted">
                    {details.map((line) => (
                      <li key={line} className="flex items-start gap-2.5">
                        <Minus className="mt-2 size-3 shrink-0 text-bright" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              <details className="group border-y border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-forest/70">
                  Delivery &amp; returns
                  <span className="text-forest/40 transition group-open:rotate-45">
                    <Plus className="size-4" strokeWidth={1.5} />
                  </span>
                </summary>
                <div className="space-y-3 pb-5 text-[0.82rem] leading-relaxed text-muted">
                  <p>
                    Deliveries are flat {formatPrice(shipping.rate)}, with
                    complimentary shipping above{" "}
                    {formatPrice(shipping.threshold)}. Cash on delivery is
                    available for every order.
                  </p>
                  <p>
                    Read the full{" "}
                    <Link href="/policies/shipping" className="underline underline-offset-4 hover:text-forest">
                      shipping policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/policies/returns" className="underline underline-offset-4 hover:text-forest">
                      return policy
                    </Link>{" "}
                    for the complete terms.
                  </p>
                </div>
              </details>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.13em] text-muted/50">
              <Package className="size-3.5" /> Packed with care, dispatched
              after confirmation
            </div>
          </div>
        </div>
      </section>

      <ViewRecorder product={product} />

      {related.length > 0 && (
        <section className="border-t border-line bg-soft">
          <div className="container-page section">
            <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow text-forest/45">The edit continues</p>
                <h2 className="title-md mt-2">You may also like</h2>
              </div>
              <Link
                href={`/category/${product.category.slug}`}
                className="btn-quiet"
              >
                More in {product.category.name} <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <ProductGrid products={related} className="mt-8" />
          </div>
        </section>
      )}

      <RecentlyViewedRail excludeId={product.id} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
