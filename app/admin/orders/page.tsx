import type { Metadata } from "next";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { orderStatusTone } from "@/lib/orders";
import { Pagination } from "@/components/shop/pagination";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Orders",
  description: "Manage OMNEXA orders.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 15;

function param(value: string | string[] | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = param(params.q).trim().slice(0, 80);
  const statusParam = param(params.status);
  const status = ORDER_STATUSES.includes(statusParam as OrderStatus)
    ? statusParam
    : "";
  const page = Math.max(1, Number(param(params.page, "1")) || 1);

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q } },
            { customerName: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, orders, grouped] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { items: { select: { id: true, quantity: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const counts = new Map(grouped.map((row) => [row.status, row._count._all]));
  const allCount = grouped.reduce((sum, row) => sum + row._count._all, 0);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (targetStatus = status, targetPage = 1) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (targetStatus) next.set("status", targetStatus);
    if (targetPage > 1) next.set("page", String(targetPage));
    const query = next.toString();
    return `/admin/orders${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Review WhatsApp orders, mark payment when it is received, and move each parcel through its journey."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 overflow-x-auto hide-scrollbar">
          <div className="flex min-w-max gap-1.5 px-1">
            <Link
              href={buildHref("")}
              className={`rounded-full border px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] transition ${
                status === ""
                  ? "border-forest bg-forest text-white"
                  : "border-line bg-white text-muted hover:border-forest/40 hover:text-forest"
              }`}
            >
              All {allCount}
            </Link>
            {ORDER_STATUSES.map((value) => (
              <Link
                key={value}
                href={buildHref(value)}
                className={`rounded-full border px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] transition ${
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

        <form method="get" className="flex items-end gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative min-w-0 flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-forest/30" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Order, customer, email…"
              aria-label="Search orders"
              className="field pl-9"
            />
          </div>
          <button type="submit" className="btn btn-forest">
            Search
          </button>
        </form>
      </div>

      <div className="border border-line bg-white">
        {orders.length === 0 ? (
          <AdminEmpty
            icon={ShoppingCart}
            title="No orders match"
            body="Try a different status or search term. New orders will appear here as customers send their bag to WhatsApp."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-[0.76rem]">
              <thead>
                <tr className="border-b border-line bg-soft/60 text-[0.52rem] uppercase tracking-[0.12em] text-muted/60">
                  <th className="px-4 py-2.5 font-semibold">Order</th>
                  <th className="px-3 py-2.5 font-semibold">Customer</th>
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                  <th className="px-3 py-2.5 font-semibold">Items</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">Payment</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-soft/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-forest transition hover:text-bright"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="mt-0.5 text-[0.6rem] text-muted/55">
                        {PAYMENT_METHOD_LABELS[
                          order.paymentMethod as PaymentMethod
                        ] ?? order.paymentMethod}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-ink">{order.customerName}</p>
                      <p className="text-[0.62rem] text-muted/60">{order.email}</p>
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`tag ${orderStatusTone(order.status)}`}>
                        {ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                          order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[0.68rem] font-medium ${
                          order.paymentStatus === "PAID"
                            ? "text-bright"
                            : order.paymentStatus === "REFUNDED"
                              ? "text-wine"
                              : "text-muted"
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[
                          order.paymentStatus as PaymentStatus
                        ] ?? order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <Pagination
          page={page}
          pageCount={pageCount}
          buildHref={(nextPage) => buildHref(status, nextPage)}
        />
      )}
    </div>
  );
}
