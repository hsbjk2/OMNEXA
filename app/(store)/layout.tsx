
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { ensureDatabase } from "@/lib/d1";
import { getCurrentUser } from "@/lib/auth";
import { fetchServerShopState } from "@/app/actions/shop";
import { getSiteSettings } from "@/lib/settings";
import { getShippingConfig } from "@/lib/shipping";
import { absoluteUrl, parseStringArray } from "@/lib/utils";
import { StoreProvider } from "@/components/providers/store-provider";
import { Announcement } from "@/components/site/announcement";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { BackToTop } from "@/components/site/back-to-top";
import { Toaster } from "@/components/site/toaster";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  await ensureDatabase();

  const [user, shopState, settings, shipping, categoryRows, popularRows] =
    await Promise.all([
      getCurrentUser(),
      fetchServerShopState(),
      getSiteSettings(),
      Promise.resolve(getShippingConfig()),
      prisma.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: { products: { where: { isPublished: true } } },
          },
        },
      }),
      prisma.product.findMany({
        where: {
          isPublished: true,
          status: { not: "COMING_SOON" },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          isDemo: true,
          category: { select: { name: true } },
        },
        orderBy: [{ isBestSeller: "desc" }, { viewCount: "desc" }],
        take: 3,
      }),
    ]);

  const categories = categoryRows.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image,
    count: category._count.products,
  }));

  const popular = popularRows.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image:
      parseStringArray(product.images)[0] || "/images/fallback-product.webp",
    category: product.category.name,
    isDemo: product.isDemo,
  }));

  const sameAs = [
    settings.instagramUrl,
    settings.facebookUrl,
    settings.whatsappChannelUrl,
    settings.googleBusinessUrl,
    settings.amazonUrl,
    settings.flipkartUrl,
  ].filter(Boolean);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.businessName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon.png"),
    description:
      "Beauty, skincare, makeup kits and artificial jewellery for everyday rituals.",
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(settings.hasLocation
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: [settings.addressLine1, settings.addressLine2]
              .filter(Boolean)
              .join(", "),
            addressLocality: settings.city,
            addressRegion: settings.state,
            postalCode: settings.pincode,
            addressCountry: "IN",
          },
        }
      : {}),
    ...(settings.contactEmail && !settings.contactEmail.endsWith(".example")
      ? { email: settings.contactEmail }
      : {}),
  };

  return (
    <StoreProvider
      initialUser={user}
      initialState={shopState}
      shipping={shipping}
    >
      <ScrollProgress />
      <Announcement threshold={shipping.threshold} />
      <Header categories={categories} popular={popular} />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer
        settings={settings}
        categories={categories}
        shipping={shipping}
      />
      <CartDrawer />
      <Toaster />
      <BackToTop />
      <WhatsAppCta whatsapp={settings.whatsapp} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </StoreProvider>
  );
}

