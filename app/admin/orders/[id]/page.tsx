import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/constants";
import { addressLines, orderStatusTone, parseOrderAddress } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderTimeline } from "@/components/account/order-timeline";

export const metadata: Metadata = {
  title: "Order detail",
  description: "Manage an OMNEXA order.",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
    },
  });

  if (!order) notFound();

  const address = parseOrderAddress(order.shippingAddress);
  const lines = addressLines(address);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest/45 transition hover:text-forest"
      >
        <ArrowLeft className="size-3.5" /> Orders
      </Link>

      <div className="mt-2">
        <AdminPageHeader
          eyebrow="Order detail"
          title={order.orderNumber}
          description={`Placed ${formatDate(order.createdAt)} · ${itemCount} ${itemCount === 1 ? "item" : "items"} · ${order.paymentMethod}`}
          actions={
            <>
              <Link
                href={`/order/${order.orderNumber}?token=${order.accessToken}`}
                target="_blank"
                className="btn btn-outline"
              >
                Customer view <ExternalLink className="size-3" />
              </Link>
              <Link href="/admin/orders" className="btn btn-outline">
                All orders
              </Link>
            </>
          }
        />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className={`tag ${orderStatusTone(order.status)}`}>
          {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
        </span>
        <span className="tag bg-white">
          Payment:{" "}
          {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ??
            order.paymentStatus}
        </span>
        <span className="tag bg-white">
          {order.userId ? "Registered customer" : "Guest checkout"}
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-5">
          <section className="border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-forest/35" strokeWidth={1.5} />
                <h2 className="text-[0.85rem] font-semibold">Items</h2>
              </div>
              <span className="text-[0.64rem] text-muted">
                {order.items.length} lines
              </span>
            </div>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 px-4 py-4">
                  <div className="relative h-[92px] w-[74px] shrink-0 overflow-hidden bg-light">
                    <Image
                      src={item.image || "/images/fallback-product.webp"}
                      alt={item.productName}
                      fill
                      sizes="74px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="font-display text-[1.1rem] leading-tight">
                      {item.productName}
                    </p>
                    {item.variant && (
                      <p className="mt-1 text-[0.62rem] uppercase tracking-[0.1em] text-muted">
                        {item.variant}
                      </p>
                    )}
                    <p className="mt-1 text-[0.64rem] text-muted/60">
                      SKU {item.sku} · Qty {item.quantity} ·{" "}
                      {formatPrice(item.price)} each
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <p className="text-[0.82rem] font-semibold text-forest">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.productId ? (
                        <Link
                          href={`/admin/products/${item.productId}`}
                          className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-forest/40 transition hover:text-forest"
                        >
                          Product
                        </Link>
                      ) : (
                        <span className="text-[0.58rem] uppercase tracking-[0.08em] text-muted/35">
                          Removed
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-2.5 border-t border-line px-4 py-4 text-[0.8rem]">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span>
                  {order.shipping === 0
                    ? "Complimentary"
                    : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <span className="text-[0.64rem] font-bold uppercase tracking-[0.1em] text-forest">
                  Total
                </span>
                <span className="font-display text-[1.55rem]">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </section>

          <section className="border border-line bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
              <Truck className="size-4 text-forest/35" strokeWidth={1.5} />
              <h2 className="text-[0.85rem] font-semibold">Fulfilment journey</h2>
            </div>
            <OrderTimeline status={order.status} />
          </section>

          <section className="border border-line bg-white">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
              <MapPin className="size-4 text-forest/35" strokeWidth={1.5} />
              <h2 className="text-[0.85rem] font-semibold">Delivery address</h2>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <p className="text-[0.8rem] font-semibold">{address.fullName}</p>
                <p className="mt-1 text-[0.76rem] leading-relaxed text-muted">
                  {lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
              <div className="space-y-2 text-[0.74rem] text-muted">
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 text-forest/35" /> {address.phone}
                </p>
                <p className="flex items-center gap-2 break-all">
                  <Mail className="size-3.5 shrink-0 text-forest/35" />
                  {order.email}
                </p>
                {order.notes && (
                  <div className="border-t border-line pt-2">
                    <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-forest/45">
                      Customer note
                    </p>
                    <p className="mt-1 leading-relaxed">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="border border-line bg-white">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
              <CreditCard className="size-4 text-forest/35" strokeWidth={1.5} />
              <h2 className="text-[0.85rem] font-semibold">Update order</h2>
            </div>
            <div className="p-4">
              <OrderStatusForm
                orderId={order.id}
                status={order.status}
                paymentStatus={order.paymentStatus}
              />
            </div>
          </section>

          <section className="border border-line bg-white p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-forest/35" strokeWidth={1.5} />
              <h2 className="text-[0.85rem] font-semibold">Customer</h2>
            </div>
            <div className="mt-3 space-y-1 text-[0.74rem]">
              <p className="font-medium text-ink">{order.customerName}</p>
              <p className="break-all text-muted">{order.email}</p>
              <p className="text-muted">{order.phone}</p>
              {order.user ? (
                <div className="mt-2 border-t border-line pt-2">
                  <p className="text-[0.6rem] uppercase tracking-[0.1em] text-muted/50">
                    Account
                  </p>
                  <Link
                    href={`/admin/customers?q=${encodeURIComponent(order.email)}`}
                    className="mt-1 inline-flex items-center gap-1 text-[0.68rem] font-semibold text-forest underline underline-offset-2"
                  >
                    View customer <ExternalLink className="size-3" />
                  </Link>
                </div>
              ) : (
                <p className="mt-2 border-t border-line pt-2 text-[0.62rem] text-muted/55">
                  Guest checkout — no account attached.
                </p>
              )}
            </div>
          </section>

          <section className="border border-line bg-white p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-forest/35" strokeWidth={1.5} />
              <h2 className="text-[0.85rem] font-semibold">Timestamps</h2>
            </div>
            <dl className="mt-3 space-y-2 text-[0.72rem]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Placed</dt>
                <dd>{formatDate(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Updated</dt>
                <dd>{formatDate(order.updatedAt, { dateStyle: "medium", timeStyle: "short" })}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
