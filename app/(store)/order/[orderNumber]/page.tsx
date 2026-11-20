import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Info,
  Mail,
  MapPin,
  Package,
  Phone,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order confirmation",
  description: "Your OMNEXA order confirmation.",
  robots: { index: false, follow: false },
};

type Params = Promise<{ orderNumber: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseAddress(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return {
      fullName: parsed.fullName || "",
      phone: parsed.phone || "",
      line1: parsed.line1 || "",
      line2: parsed.line2 || "",
      city: parsed.city || "",
      state: parsed.state || "",
      pincode: parsed.pincode || "",
      email: parsed.email || "",
    };
  } catch {
    return {
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      email: "",
    };
  }
}

function statusTone(status: string) {
  if (status === "DELIVERED") return "bg-[#e7f2e9] text-forest";
  if (status === "CANCELLED") return "bg-[#f3e4e4] text-wine";
  if (status === "SHIPPED" || status === "PACKED") {
    return "bg-light text-forest";
  }
  return "bg-[#f4efe1] text-[#6c5626]";
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orderNumber } = await params;
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";
  const user = await getCurrentUser();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  const tokenMatches = token.length > 0 && token === order.accessToken;
  const userMatches = Boolean(user && order.userId === user.id);

  if (!tokenMatches && !userMatches) notFound();

  const address = parseAddress(order.shippingAddress);

  return (
    <section className="bg-soft">
      <div className="container-page max-w-5xl py-12 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-light text-forest">
            <CheckCircle2 className="size-7" strokeWidth={1.4} />
          </span>
          <p className="eyebrow mt-6 text-forest/45">Order received</p>
          <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.94] tracking-[-0.04em]">
            Thank you — your order
            <br />
            <span className="italic text-forest/65">is with us.</span>
          </h1>
          <p className="mt-4 max-w-lg text-[0.88rem] leading-relaxed text-muted">
            We have recorded your demonstration order. It will not be
            dispatched and no cash will be collected. Your order number is{" "}
            <span className="font-semibold text-forest">{order.orderNumber}</span>.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span
              className={`tag ${statusTone(order.status)}`}
            >
              {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
            </span>
            <span className="tag bg-white">
              Cash on delivery ·{" "}
              {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ??
                order.paymentStatus}
            </span>
            <span className="tag bg-white">
              Placed {formatDate(order.createdAt)}
            </span>
          </div>
          <div className="mt-5 flex max-w-xl items-start gap-2.5 border border-[#e4d9b7] bg-[#faf6e9] p-3.5 text-left text-[0.72rem] leading-relaxed text-[#6a5827]">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong className="font-semibold">Demonstration order.</strong>{" "}
              This order is recorded in the demo database and moves through
              statuses for testing. No parcel will be dispatched and no payment
              will be collected.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <p className="eyebrow text-forest/50">Your pieces</p>
            </div>
            <ul className="divide-y divide-line px-5">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <div className="relative h-[110px] w-[86px] shrink-0 overflow-hidden bg-light">
                    <Image
                      src={item.image || "/images/fallback-product.webp"}
                      alt={item.productName}
                      fill
                      sizes="86px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="font-display text-[1.2rem] leading-tight">
                      {item.productName}
                    </p>
                    {item.variant && (
                      <p className="mt-1 text-[0.64rem] uppercase tracking-[0.11em] text-muted">
                        {item.variant}
                      </p>
                    )}
                    <p className="mt-1 text-[0.68rem] text-muted/65">
                      SKU {item.sku} · Qty {item.quantity}
                    </p>
                    <p className="mt-auto pt-2 text-sm font-semibold text-forest">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-2.5 border-t border-line px-5 py-4 text-sm">
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
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-forest">
                  Total
                </span>
                <span className="font-display text-2xl">
                  {formatPrice(order.total)}
                </span>
              </div>
              <p className="pt-1 text-[0.65rem] leading-relaxed text-muted">
                Cash on delivery is the configured payment method. No payment
                is collected in this demonstration.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-line bg-white p-5">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-forest/50" strokeWidth={1.4} />
                <p className="eyebrow text-forest/50">Deliver to</p>
              </div>
              <p className="mt-3 text-sm font-semibold">{address.fullName}</p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.state} {address.pincode}
              </p>
              <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[0.75rem] text-muted">
                {address.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-3 text-forest/40" /> {address.phone}
                  </p>
                )}
                <p className="flex items-center gap-2 break-all">
                  <Mail className="size-3 shrink-0 text-forest/40" /> {order.email}
                </p>
              </div>
            </div>

            <div className="border border-line bg-white p-5">
              <div className="flex items-center gap-2">
                <Clock3 className="size-4 text-forest/50" strokeWidth={1.4} />
                <p className="eyebrow text-forest/50">What happens next</p>
              </div>
              <ol className="mt-3 space-y-3 text-[0.78rem] leading-relaxed text-muted">
                <li className="flex gap-2.5">
                  <span className="mt-1 text-[0.58rem] font-bold text-forest/35">01</span>
                  The demo order is recorded and stock is reserved in the
                  catalogue.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1 text-[0.58rem] font-bold text-forest/35">02</span>
                  An administrator can move the order through its statuses in
                  the admin panel.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1 text-[0.58rem] font-bold text-forest/35">03</span>
                  No parcel is dispatched and no cash is collected. Statuses are
                  for this preview only.
                </li>
              </ol>
              {order.notes && (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-forest/45">
                    Your note
                  </p>
                  <p className="mt-1 text-[0.78rem] leading-relaxed text-muted">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="border border-line bg-light/60 p-5 text-[0.7rem] leading-relaxed text-forest/60">
              <Package className="size-4" />
              <p className="mt-2">
                Keep this confirmation link private — it provides access to this
                order. Signed-in customers can also find the order in their
                account.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {userMatches && (
                <Link href="/account/orders" className="btn btn-outline">
                  View all orders
                </Link>
              )}
              <Link href="/shop" className="btn btn-forest">
                Continue shopping <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/contact"
                className="text-center text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-forest/45 transition hover:text-forest"
              >
                Ask about this order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
