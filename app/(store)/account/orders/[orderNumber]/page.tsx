import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Info,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { buildOrderWhatsAppHref } from "@/lib/whatsapp";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/constants";
import { addressLines, orderStatusTone, parseOrderAddress } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/utils";
import { OrderTimeline } from "@/components/account/order-timeline";
import { WhatsAppIcon } from "@/components/site/social-icons";

export const metadata: Metadata = {
  title: "Order details",
  description: "View your OMNEXA order.",
  robots: { index: false, follow: false },
};

type Params = Promise<{ orderNumber: string }>;

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const user = await requireUser("/account/orders");
  const { orderNumber } = await params;

  const order = await prisma.order.findFirst({
    where: { orderNumber, userId: user.id },
    include: { items: true },
  });

  if (!order) notFound();

  const address = parseOrderAddress(order.shippingAddress);
  const lines = addressLines(address);
  const settings = await getSiteSettings();
  const whatsappHref = buildOrderWhatsAppHref(order, settings.whatsapp);
  const paymentMethod =
    PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod] ??
    order.paymentMethod;

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-forest/50 transition hover:text-forest"
      >
        <ArrowLeft className="size-3.5" /> All orders
      </Link>

      <div className="mt-5 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-forest/45">Order details</p>
          <h2 className="mt-2 font-display text-[2rem] leading-tight sm:text-[2.5rem]">
            {order.orderNumber}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <span className={`tag ${orderStatusTone(order.status)}`}>
              {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
            </span>
            <span className="text-[0.7rem] text-muted">
              Placed {formatDate(order.createdAt)}
            </span>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-[0.58rem] uppercase tracking-[0.13em] text-muted/60">
            Order total
          </p>
          <p className="font-display text-[2rem] leading-tight">
            {formatPrice(order.total)}
          </p>
          <p className="text-[0.68rem] text-muted">
            {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ??
              order.paymentStatus}{" "}
            · {paymentMethod}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2.5 border border-[#e4d9b7] bg-[#faf6e9] p-3.5 text-[0.72rem] leading-relaxed text-[#6a5827]">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          <strong className="font-semibold">WhatsApp order.</strong> The store
          confirms availability, delivery and payment in your WhatsApp chat.
          Product details and photography are demonstration data.
        </p>
      </div>

      <div className="mt-6 border border-line bg-white p-5">
        <p className="eyebrow mb-5 text-forest/45">Order journey</p>
        <OrderTimeline status={order.status} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <p className="eyebrow text-forest/45">Pieces in this order</p>
          </div>
          <ul className="divide-y divide-line px-5">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <div className="relative h-[96px] w-[76px] shrink-0 overflow-hidden bg-light">
                  <Image
                    src={item.image || "/images/fallback-product.webp"}
                    alt={item.productName}
                    fill
                    sizes="76px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="font-display text-[1.15rem] leading-tight">
                    {item.productName}
                  </p>
                  {item.variant && (
                    <p className="mt-1 text-[0.62rem] uppercase tracking-[0.1em] text-muted">
                      {item.variant}
                    </p>
                  )}
                  <p className="mt-1 text-[0.66rem] text-muted/65">
                    SKU {item.sku} · Qty {item.quantity} ·{" "}
                    {formatPrice(item.price)} each
                  </p>
                  <p className="mt-auto pt-2 text-[0.85rem] font-semibold text-forest">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="space-y-2.5 border-t border-line px-5 py-4 text-[0.82rem]">
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
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-forest">
                Total
              </span>
              <span className="font-display text-[1.6rem]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="border border-line bg-white p-5">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-forest/45" strokeWidth={1.4} />
              <p className="eyebrow text-forest/45">Delivery address</p>
            </div>
            <p className="mt-3 text-[0.82rem] font-semibold">{address.fullName}</p>
            <p className="mt-1 text-[0.78rem] leading-relaxed text-muted">
              {lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[0.72rem] text-muted">
              <p className="flex items-center gap-2">
                <Phone className="size-3 text-forest/40" /> {address.phone}
              </p>
              <p className="flex items-center gap-2 break-all">
                <Mail className="size-3 shrink-0 text-forest/40" /> {order.email}
              </p>
            </div>
          </div>

          <div className="border border-line bg-white p-5">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-forest/45" strokeWidth={1.4} />
              <p className="eyebrow text-forest/45">Payment on WhatsApp</p>
            </div>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
              The seller replies with the payment options in your WhatsApp chat.
              No payment is collected on this website. Your order is packed and
              dispatched after payment is confirmed.
            </p>
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-[0.7rem] text-muted">
              <PackageCheck className="size-3.5 text-forest/40" />
              {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ??
                order.paymentStatus}
            </div>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-forest underline underline-offset-4"
              >
                <WhatsAppIcon className="size-3.5" /> Reopen the order chat
              </a>
            )}
          </div>

          <div className="border border-line bg-light/60 p-5 text-[0.74rem] leading-relaxed text-forest/65">
            <Truck className="size-4" />
            <p className="mt-2">
              {order.status === "CANCELLED"
                ? "This order was cancelled. Any reserved stock has been returned to the catalogue."
                : "Orders are packed and dispatched after payment is confirmed with the seller on WhatsApp."}
            </p>
            <Link
              href={`/contact?subject=${encodeURIComponent(`Order ${order.orderNumber}`)}`}
              className="mt-3 inline-block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-forest underline underline-offset-4"
            >
              Ask about this order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
