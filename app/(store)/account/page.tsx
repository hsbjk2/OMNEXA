import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MapPin,
  Package,
  Search,
  ShieldAlert,
  Sparkles,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { orderStatusTone } from "@/lib/orders";
import { ClearSearchHistory } from "@/components/account/clear-search-history";

export const metadata: Metadata = {
  title: "Overview",
  description: "Your OMNEXA account overview.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

  const [orders, addresses, wishlistCount, cartCount, searchRows] =
    await Promise.all([
      prisma.order.findMany({
        where: { userId: user.id },
        include: { items: { select: { id: true, image: true, productName: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.address.count({ where: { userId: user.id } }),
      prisma.wishlistItem.count({ where: { userId: user.id } }),
      prisma.cartItem.count({ where: { userId: user.id } }),
      prisma.searchHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 24,
        select: { query: true },
      }),
    ]);

  const orderCount = await prisma.order.count({ where: { userId: user.id } });
  const openOrders = await prisma.order.count({
    where: {
      userId: user.id,
      status: { in: ["PENDING", "CONFIRMED", "PACKED", "SHIPPED"] },
    },
  });

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

  const stats = [
    {
      label: "Total orders",
      value: orderCount,
      href: "/account/orders",
      icon: Package,
    },
    {
      label: "In progress",
      value: openOrders,
      href: "/account/orders",
      icon: Truck,
    },
    {
      label: "Saved addresses",
      value: addresses,
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      label: "Wishlist",
      value: wishlistCount,
      href: "/wishlist",
      icon: Heart,
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
              This area is only available to store administrators. Your
              customer account is unchanged — manage your orders and details
              below, or continue shopping.
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
              <p className="eyebrow text-forest/45">Recent orders</p>
              <h2 className="mt-1 font-display text-[1.5rem] leading-tight">
                Your latest pieces
              </h2>
            </div>
            <Link
              href="/account/orders"
              className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-forest/50 transition hover:text-forest"
            >
              View all
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Sparkles className="mx-auto size-6 text-forest/25" strokeWidth={1.3} />
              <p className="mt-4 font-display text-[1.5rem]">
                Your first order is yet to be placed.
              </p>
              <p className="mx-auto mt-2 max-w-sm text-[0.82rem] leading-relaxed text-muted">
                Explore considered skincare, colour and jewellery for the
                everyday.
              </p>
              <Link href="/shop" className="btn btn-forest mt-5">
                Shop the collection <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-soft"
                  >
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="relative size-11 overflow-hidden rounded-full border-2 border-white bg-light"
                        >
                          <Image
                            src={item.image || "/images/fallback-product.webp"}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </span>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.82rem] font-semibold text-ink">
                        {order.orderNumber}
                      </p>
                      <p className="mt-0.5 text-[0.68rem] text-muted">
                        {formatDate(order.createdAt)} ·{" "}
                        {order.items.length === 1
                          ? "1 piece"
                          : `${order.items.length} pieces`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[1.15rem]">
                        {formatPrice(order.total)}
                      </p>
                      <span
                        className={`tag mt-1 ${orderStatusTone(order.status)}`}
                      >
                        {ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                          order.status}
                      </span>
                    </div>
                    <ArrowRight className="hidden size-4 text-forest/25 transition group-hover:translate-x-0.5 group-hover:text-forest sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-5">
          <div className="border border-line bg-white p-5">
            <p className="eyebrow text-forest/45">In your cabinet</p>
            <div className="mt-4 space-y-3">
              <Link
                href="/cart"
                className="flex items-center justify-between border-b border-line pb-3 text-[0.8rem] text-ink transition hover:text-forest"
              >
                <span>Items in your bag</span>
                <span className="font-semibold">{cartCount}</span>
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center justify-between border-b border-line pb-3 text-[0.8rem] text-ink transition hover:text-forest"
              >
                <span>Saved to wishlist</span>
                <span className="font-semibold">{wishlistCount}</span>
              </Link>
              <Link
                href="/account/profile"
                className="flex items-center justify-between text-[0.8rem] text-ink transition hover:text-forest"
              >
                <span>Account details</span>
                <ArrowRight className="size-3.5 text-forest/35" />
              </Link>
            </div>
          </div>

          <div className="border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-forest/45">Recent searches</p>
              {searchHistory.length > 0 && <ClearSearchHistory />}
            </div>
            {searchHistory.length === 0 ? (
              <p className="mt-3 text-[0.78rem] leading-relaxed text-muted">
                Searches you make while signed in appear here for quick
                reference.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
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

          <div className="border border-line bg-light/60 p-5">
            <p className="eyebrow text-forest/45">Need a hand?</p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-muted">
              Questions about an order, a formula or a wholesale enquiry — our
              team is one message away.
            </p>
            <Link href="/contact" className="btn-quiet mt-3">
              Contact us <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
