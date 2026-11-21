import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Heart,
  MapPin,
  Search,
  ShoppingBag,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import {
  productCardInclude,
  toProductCard,
  type ProductCardData,
} from "@/lib/products";
import { buildWhatsAppHref, isWhatsAppConfigured } from "@/lib/whatsapp";
import { formatPrice, isValidHttpUrl, parseStringArray } from "@/lib/utils";
import { ClearSearchHistory } from "@/components/account/clear-search-history";
import { WhatsAppIcon } from "@/components/site/social-icons";

export const metadata: Metadata = {
  title: "Overview",
  description: "Your OMNEXA account overview.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function productImage(images: string) {
  return parseStringArray(images)[0] || "/images/fallback-product.webp";
}

function CompactProduct({
  product,
  note,
}: {
  product: ProductCardData;
  note?: string;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex items-center gap-3 border border-line bg-white p-2.5 transition hover:border-forest/30"
    >
      <span className="relative size-14 shrink-0 overflow-hidden bg-light">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="56px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.78rem] font-medium text-ink">
          {product.name}
        </span>
        <span className="mt-0.5 block text-[0.68rem] text-muted">
          {note || formatPrice(product.price)}
        </span>
      </span>
      <ArrowRight className="size-3.5 shrink-0 text-forest/25 transition group-hover:text-forest" />
    </Link>
  );
}

export default async function AccountOverviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [user, params] = await Promise.all([
    requireUser("/account"),
    searchParams,
  ]);
  const restricted = params.restricted === "1";

  const [cartRows, wishlistRows, addresses, searchRows, recentRows, settings] =
    await Promise.all([
      prisma.cartItem.findMany({
        where: { userId: user.id },
        include: { product: { include: productCardInclude } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.wishlistItem.findMany({
        where: { userId: user.id },
        include: { product: { include: productCardInclude } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
      prisma.searchHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 24,
        select: { query: true },
      }),
      prisma.recentlyViewed.findMany({
        where: { userId: user.id },
        include: { product: { include: productCardInclude } },
        orderBy: { viewedAt: "desc" },
        take: 4,
      }),
      getSiteSettings(),
    ]);

  const cart = cartRows
    .filter((row) => row.product.isPublished)
    .map((row) => ({
      ...row,
      product: toProductCard(row.product),
      image: productImage(row.product.images),
    }));
  const cartCount = cart.reduce((sum, row) => sum + row.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, row) => sum + row.product.price * row.quantity,
    0,
  );
  const wishlist = wishlistRows
    .filter((row) => row.product.isPublished)
    .map((row) => toProductCard(row.product));
  const recent = recentRows
    .filter((row) => row.product.isPublished)
    .map((row) => toProductCard(row.product));

  const seen = new Set<string>();
  const searchHistory = searchRows
    .filter((row) => {
      const key = row.query.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6)
    .map((row) => row.query);

  const whatsappHref = buildWhatsAppHref(
    settings.whatsapp,
    "Hi OMNEXA! I have a question about your products and would love some help.",
  );
  const amazonUrl = isValidHttpUrl(settings.amazonUrl)
    ? settings.amazonUrl
    : null;
  const flipkartUrl = isValidHttpUrl(settings.flipkartUrl)
    ? settings.flipkartUrl
    : null;

  const stats = [
    {
      label: "Bag pieces",
      value: cartCount,
      href: "/cart",
      icon: ShoppingBag,
    },
    {
      label: "Wishlist",
      value: wishlist.length,
      href: "/wishlist",
      icon: Heart,
    },
    {
      label: "Saved addresses",
      value: addresses.length,
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      label: "Recent searches",
      value: searchHistory.length,
      href: "#recent-searches",
      icon: Search,
    },
  ];

  return (
    <div className="space-y-8">
      {restricted && (
        <div
          role="status"
          className="flex items-start gap-3 border border-[#d9c88f] bg-[#fbf6e6] p-4 text-[0.78rem] leading-relaxed text-[#5f5328]"
        >
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold text-[#453c1c]">
              Admin tools are restricted
            </p>
            <p className="mt-0.5 text-[#6b5f33]">
              This area is only available to store administrators. Your customer
              account is unchanged — browse your saved pieces and details below,
              or continue shopping.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group border border-line bg-white p-4 transition hover:border-forest/30 sm:p-5"
          >
            <div className="flex items-start justify-between">
              <stat.icon
                className="size-4 text-forest/45 transition group-hover:text-forest"
                strokeWidth={1.5}
              />
              <ArrowRight className="size-3.5 text-forest/20 transition group-hover:translate-x-0.5 group-hover:text-forest/60" />
            </div>
            <p className="mt-4 font-display text-[2rem] leading-none">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="eyebrow text-forest/45">My cart</p>
              <h2 className="mt-1 font-display text-[1.5rem] leading-tight">
                Ready when you are
              </h2>
            </div>
            <Link
              href="/cart"
              className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-forest/50 transition hover:text-forest"
            >
              View bag
            </Link>
          </div>

          {cart.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Sparkles
                className="mx-auto size-6 text-forest/25"
                strokeWidth={1.3}
              />
              <p className="mt-3 font-display text-[1.4rem]">
                Your bag is waiting for its first piece.
              </p>
              <p className="mx-auto mt-2 max-w-sm text-[0.8rem] leading-relaxed text-muted">
                Save what you love, send the enquiry on WhatsApp, and the seller
                will confirm availability, delivery and payment in chat.
              </p>
              <Link href="/shop" className="btn btn-forest mt-5">
                Shop the collection <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {cart.slice(0, 3).map((line) => (
                  <li key={`${line.productId}-${line.variant}`}>
                    <Link
                      href={`/product/${line.product.slug}`}
                      className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-soft/60"
                    >
                      <span className="relative size-14 shrink-0 overflow-hidden bg-light">
                        <Image
                          src={line.image}
                          alt={line.product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.82rem] font-medium text-ink">
                          {line.product.name}
                        </span>
                        <span className="mt-0.5 block text-[0.66rem] text-muted">
                          {line.quantity}{" "}
                          {line.quantity === 1 ? "piece" : "pieces"}
                          {line.variant ? ` · ${line.variant}` : ""}
                        </span>
                      </span>
                      <span className="text-[0.8rem] font-semibold text-forest">
                        {formatPrice(line.product.price * line.quantity)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.72rem] text-muted">
                  Estimated subtotal{" "}
                  <span className="font-semibold text-ink">
                    {formatPrice(cartSubtotal)}
                  </span>
                </p>
                <Link href="/order-request" className="btn btn-forest">
                  <WhatsAppIcon className="size-3.5" /> Order via WhatsApp
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="space-y-5">
          <div className="border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-forest/45">Personal information</p>
              <Link
                href="/account/profile"
                className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-forest/50 transition hover:text-forest"
              >
                Edit
              </Link>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-light text-forest">
                <UserRound className="size-4" strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[0.82rem] font-medium text-ink">
                  {user.name}
                </p>
                <p className="truncate text-[0.7rem] text-muted">
                  {user.email}
                </p>
                {user.phone && (
                  <p className="mt-0.5 text-[0.7rem] text-muted">
                    {user.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-forest/45">Saved addresses</p>
              <Link
                href="/account/addresses"
                className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-forest/50 transition hover:text-forest"
              >
                Manage
              </Link>
            </div>
            {addresses.length === 0 ? (
              <p className="mt-3 text-[0.78rem] leading-relaxed text-muted">
                Save a delivery address to make your next WhatsApp enquiry
                quicker.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {addresses.slice(0, 2).map((address) => (
                  <li
                    key={address.id}
                    className="border-b border-line pb-3 text-[0.72rem] leading-relaxed text-muted last:border-0 last:pb-0"
                  >
                    <span className="block text-[0.58rem] font-bold uppercase tracking-[0.12em] text-forest/55">
                      {address.label}
                      {address.isDefault ? " · Default" : ""}
                    </span>
                    <span className="mt-1 block text-ink">
                      {address.fullName}
                    </span>
                    <span className="block">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                      {address.state} {address.pincode}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="eyebrow text-forest/45">My wishlist</p>
              <h2 className="mt-1 font-display text-[1.4rem] leading-tight">
                Saved for later
              </h2>
            </div>
            <Link
              href="/wishlist"
              className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-forest/50 transition hover:text-forest"
            >
              View all
            </Link>
          </div>
          {wishlist.length === 0 ? (
            <p className="px-5 py-8 text-[0.8rem] leading-relaxed text-muted">
              Tap the heart on any product to keep it here.
            </p>
          ) : (
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {wishlist.slice(0, 4).map((product) => (
                <CompactProduct key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <div className="border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="eyebrow text-forest/45">Recently viewed</p>
              <h2 className="mt-1 font-display text-[1.4rem] leading-tight">
                Pick up where you left off
              </h2>
            </div>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-[0.8rem] leading-relaxed text-muted">
              Products you open while signed in will appear here.
            </p>
          ) : (
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {recent.map((product) => (
                <CompactProduct key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <div id="recent-searches" className="border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-forest/45">Search history</p>
              <h2 className="mt-1 font-display text-[1.4rem] leading-tight">
                What you were looking for
              </h2>
            </div>
            {searchHistory.length > 0 && <ClearSearchHistory />}
          </div>
          {searchHistory.length === 0 ? (
            <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
              Searches you make while signed in appear here for quick reference.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchHistory.map((query) => (
                <Link
                  key={query}
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.7rem] text-forest/70 transition hover:border-forest hover:text-forest"
                >
                  <Search className="size-3" /> {query}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border border-line bg-white p-5">
          <p className="eyebrow text-forest/45">Marketplace & WhatsApp</p>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-muted">
            Shop OMNEXA&apos;s official marketplace stores, or message the team
            directly for availability, delivery and payment arrangements.
          </p>
          <div className="mt-4 grid gap-2">
            {amazonUrl && (
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline justify-between"
              >
                Amazon storefront <ExternalLink className="size-3.5" />
              </a>
            )}
            {flipkartUrl && (
              <a
                href={flipkartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline justify-between"
              >
                Flipkart storefront <ExternalLink className="size-3.5" />
              </a>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-forest justify-between"
              >
                <span className="flex items-center gap-2">
                  <WhatsAppIcon className="size-4" /> WhatsApp OMNEXA
                </span>
                <ArrowRight className="size-3.5" />
              </a>
            )}
          </div>
          {!amazonUrl && !flipkartUrl && (
            <p className="mt-3 text-[0.66rem] leading-relaxed text-muted/65">
              Amazon and Flipkart storefront links will appear here once the
              seller adds them in settings.
            </p>
          )}
          {!isWhatsAppConfigured(settings.whatsapp) && (
            <p className="mt-3 text-[0.66rem] leading-relaxed text-muted/65">
              WhatsApp contact becomes available once the business number is
              configured.
            </p>
          )}
        </div>
      </div>

      <div className="border border-line bg-light/60 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-forest/45">Need a hand?</p>
            <p className="mt-2 max-w-xl text-[0.8rem] leading-relaxed text-muted">
              Questions about a product, a formula or a wholesale enquiry — our
              team is one message away. Final purchase details are always
              confirmed directly on WhatsApp.
            </p>
          </div>
          <Link href="/contact" className="btn btn-outline shrink-0">
            Contact us <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
