"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const {
    cart,
    cartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    shipping,
  } = useStore();

  const subtotal = cart.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  const delivery = subtotal >= shipping.threshold ? 0 : shipping.rate;
  const remaining = Math.max(0, shipping.threshold - subtotal);
  const progress = Math.min(100, (subtotal / shipping.threshold) * 100);

  if (cart.length === 0) {
    return (
      <section className="bg-soft">
        <div className="container-page py-16 sm:py-24">
          <div className="mx-auto flex max-w-lg flex-col items-center text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-light text-forest">
              <ShoppingBag className="size-7" strokeWidth={1.2} />
            </span>
            <p className="eyebrow mt-7 text-forest/45">Your bag</p>
            <h1 className="mt-3 font-display text-[clamp(2.8rem,6vw,4.5rem)] leading-[0.94] tracking-[-0.04em]">
              An empty bag,
              <br />
              <span className="italic text-forest/65">a fresh start.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Nothing saved here yet. Explore skincare, colour, kits and
              jewellery for the everyday.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="btn btn-forest">
                Shop the collection <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/wishlist" className="btn btn-outline">
                View wishlist
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-page py-10 sm:py-14">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-forest/50 transition hover:text-forest"
          >
            <ArrowLeft className="size-3.5" /> Continue shopping
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-forest/45">Your selection</p>
              <h1 className="mt-3 font-display text-[clamp(2.7rem,5vw,4.2rem)] leading-[0.96] tracking-[-0.04em]">
                Your bag
              </h1>
            </div>
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-forest/50">
              {cartCount} {cartCount === 1 ? "piece" : "pieces"} ·{" "}
              {formatPrice(subtotal)}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:gap-16">
          <div>
            <div className="flex items-center justify-between border-b border-line pb-4">
              <p className="eyebrow text-forest/50">Bag contents</p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Remove every item from your bag?")) {
                    clearCart();
                  }
                }}
                className="text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-muted/60 underline underline-offset-4 transition hover:text-wine"
              >
                Empty bag
              </button>
            </div>

            <ul className="divide-y divide-line">
              {cart.map((line) => (
                <li
                  key={`${line.productId}-${line.variant}`}
                  className="flex gap-4 py-6 sm:gap-6"
                >
                  <Link
                    href={`/product/${line.slug}`}
                    className="relative block h-[140px] w-[108px] shrink-0 overflow-hidden bg-light sm:h-[170px] sm:w-[132px]"
                  >
                    <Image
                      src={line.image || "/images/fallback-product.webp"}
                      alt={line.name}
                      fill
                      sizes="132px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/product/${line.slug}`}
                          className="font-display text-[1.3rem] leading-[1.1] text-ink transition hover:text-forest sm:text-[1.55rem]"
                        >
                          {line.name}
                        </Link>
                        {line.variant && (
                          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                            {line.variant}
                          </p>
                        )}
                        <p className="mt-2 text-[0.82rem] font-semibold text-forest">
                          {formatPrice(line.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.productId, line.variant)}
                        aria-label={`Remove ${line.name}`}
                        className="flex size-8 shrink-0 items-center justify-center text-forest/30 transition hover:text-wine"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                      <div className="flex h-10 items-center border border-line bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              line.productId,
                              line.variant,
                              line.quantity - 1,
                            )
                          }
                          disabled={line.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="flex size-9 items-center justify-center text-forest/55 transition hover:text-forest disabled:opacity-30"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-[0.8rem] font-semibold tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              line.productId,
                              line.variant,
                              line.quantity + 1,
                            )
                          }
                          disabled={line.quantity >= line.stock}
                          aria-label="Increase quantity"
                          className="flex size-9 items-center justify-center text-forest/55 transition hover:text-forest disabled:opacity-30"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-forest">
                        {formatPrice(line.price * line.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-start gap-2.5 border border-line bg-light/60 px-4 py-3 text-[0.72rem] leading-relaxed text-forest/55">
              <Truck className="mt-0.5 size-4 shrink-0" strokeWidth={1.4} />
              <p>
                {remaining > 0
                  ? `Add ${formatPrice(
                      remaining,
                    )} more to unlock complimentary shipping.`
                  : "Your bag qualifies for complimentary shipping."}
              </p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-white p-6">
              <p className="eyebrow text-forest/50">Order summary</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Delivery</span>
                  <span className="font-medium text-ink">
                    {delivery === 0 ? "Complimentary" : formatPrice(delivery)}
                  </span>
                </div>
                <div className="h-px bg-line" />
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-forest">
                    Total
                  </span>
                  <span className="font-display text-3xl text-ink">
                    {formatPrice(subtotal + delivery)}
                  </span>
                </div>
              </div>

              {remaining > 0 ? (
                <div className="mt-5">
                  <div className="h-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-bright transition-[width] duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
                    {formatPrice(remaining)} away from free delivery.
                  </p>
                </div>
              ) : (
                <p className="mt-4 flex items-center gap-1.5 text-[0.68rem] font-medium text-forest">
                  <Check className="size-3.5 text-bright" /> Free delivery applied
                </p>
              )}

              <Link href="/checkout" className="btn btn-forest mt-6 w-full">
                Continue to checkout <ArrowRight className="size-3.5" />
              </Link>
              <p className="mt-3 text-center text-[0.62rem] leading-relaxed text-muted">
                Order on WhatsApp · Secure server-validated checkout
              </p>
              <div className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-[0.62rem] leading-relaxed text-muted">
                <Truck className="mt-0.5 size-3.5 shrink-0 text-forest/40" />
                Delivery is calculated from the live store settings. The exact
                total is always confirmed before you place the order.
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
