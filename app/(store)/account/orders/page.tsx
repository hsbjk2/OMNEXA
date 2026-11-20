import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { orderStatusTone } from "@/lib/orders";
import { Pagination } from "@/components/shop/pagination";

export const metadata: Metadata = {
  title: "Orders",
  description: "Your OMNEXA order history.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 8;

function readParam(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser("/account/orders");
  const params = await searchParams;
  const statusParam = readParam(params.status);
  const status = ORDER_STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : "";
  const page = Math.max(1, Number(readParam(params.page, "1")) || 1);

  const where = {
    userId: user.id,
    ...(status ? { status } : {}),
  };

  const [total, orders, grouped] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            image: true,
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { _all: true },
    }),
  ]);

  const counts = new Map(grouped.map((row) => [row.status, row._count._all]));
  const totalOrders = grouped.reduce((sum, row) => sum + row._count._all, 0);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (targetStatus: string, targetPage = 1) => {
    const q = new URLSearchParams();
    if (targetStatus) q.set("status", targetStatus);
    if (targetPage > 1) q.set("page", String(targetPage));
    const query = q.toString();
    return `/account/orders${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-forest/45">Order history</p>
          <h2 className="mt-2 font-display text-[2rem] leading-tight sm:text-[2.4rem]">
            Every parcel, in one place.
          </h2>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">
            {totalOrders === 0
              ? "No orders yet."
              : `${totalOrders} ${totalOrders === 1 ? "order" : "orders"} placed with OMNEXA.`}
          </p>
        </div>
        <Link href="/shop" className="btn btn-outline">
          <ShoppingBag className="size-3.5" /> Continue shopping
        </Link>
      </div>

      <div className="-mx-1 mt-6 overflow-x-auto hide-scrollbar">
        <div className="flex min-w-max gap-1.5 px-1">
          <Link
            href={buildHref("")}
            className={`rounded-full border px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.1em] transition ${
              status === ""
                ? "border-forest bg-forest text-white"
                : "border-line bg-white text-muted hover:border-forest/40 hover:text-forest"
            }`}
          >
            All {totalOrders}
          </Link>
          {ORDER_STATUSES.map((value) => (
            <Link
              key={value}
              href={buildHref(value)}
              className={`rounded-full border px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.1em] transition ${
                status === value
                  ? "border-forest bg-forest text-white"
                  : "border-line bg-white text-muted hover:border-forest/40 hover:text-forest"
              }`}
            >
              {ORDER_STATUS_LABELS[value]} {counts.get(value) ?? 0}
            </Link>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 border border-line bg-white px-5 py-16 text-center">
          <Package className="mx-auto size-7 text-forest/25" strokeWidth={1.2} />
          <p className="mt-4 font-display text-[1.6rem]">
            {status
              ? `No ${ORDER_STATUS_LABELS[status as OrderStatus].toLowerCase()} orders.`
              : "No orders here yet."}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[0.82rem] leading-relaxed text-muted">
            {status
              ? "Try a different status, or browse the full collection."
              : "When you place an order it will appear here with its full journey."}
          </p>
          <Link href={status ? "/account/orders" : "/shop"} className="btn btn-forest mt-5">
            {status ? "View all orders" : "Shop the collection"}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="border border-line bg-white">
              <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-[0.82rem] font-semibold tracking-wide text-ink">
                      {order.orderNumber}
                    </p>
                    <span className={`tag ${orderStatusTone(order.status)}`}>
                      {ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                        order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.68rem] text-muted">
                    Placed {formatDate(order.createdAt)} · {order.items.length}{" "}
                    {order.items.length === 1 ? "line" : "lines"} · Cash on
                    delivery
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[0.55rem] uppercase tracking-[0.12em] text-muted/60">
                      Total
                    </p>
                    <p className="font-display text-[1.35rem] leading-tight">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="btn btn-outline px-4 py-3"
                  >
                    View order
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5">
                      <div className="relative size-12 overflow-hidden bg-light">
                        <Image
                          src={item.image || "/images/fallback-product.webp"}
                          alt={item.productName}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="max-w-[160px]">
                        <p className="truncate text-[0.74rem] font-medium text-ink">
                          {item.productName}
                        </p>
                        <p className="text-[0.64rem] text-muted">
                          Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-[0.68rem] text-muted">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-8">
          <Pagination
            page={page}
            pageCount={pageCount}
            buildHref={(nextPage) => buildHref(status, nextPage)}
          />
        </div>
      )}
    </div>
  );
}
