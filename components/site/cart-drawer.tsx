"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const pathname = usePathname();
  const {
    cart,
    cartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    shipping,
  } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!cartOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 120);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [cartOpen, closeCart]);

  const subtotal = cart.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  const remaining = Math.max(0, shipping.threshold - subtotal);
  const progress = Math.min(100, (subtotal / shipping.threshold) * 100);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[140]"
        >
          <button
            type="button"
            aria-label="Close bag"
            onClick={closeCart}
            className="absolute inset-0 bg-deep/55 backdrop-blur-[2px]"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-soft shadow-2xl"
          >
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-line px-5 sm:px-7">
              <div>
                <p className="eyebrow text-forest/45">Your bag</p>
                <p className="mt-0.5 font-display text-2xl leading-none">
                  {cartCount === 0
                    ? "Nothing here yet"
                    : `${cartCount} ${cartCount === 1 ? "piece" : "pieces"}`}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="flex size-9 items-center justify-center text-forest/60 transition hover:text-forest"
              >
                <X className="size-5" strokeWidth={1.4} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-light text-forest">
                  <ShoppingBag className="size-6" strokeWidth={1.3} />
                </span>
                <h2 className="mt-6 font-display text-3xl leading-tight">
                  An empty bag,
                  <br />a fresh start.
                </h2>
                <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-muted">
                  Explore considered skincare, colour and jewellery for the
                  everyday.
                </p>
                <Link href="/shop" onClick={closeCart} className="btn btn-forest mt-6">
                  Shop the collection
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-line px-5 py-4 sm:px-7">
                  {remaining > 0 ? (
                    <p className="text-[0.72rem] leading-relaxed text-muted">
                      You&apos;re{" "}
                      <span className="font-semibold text-forest">
                        {formatPrice(remaining)}
                      </span>{" "}
                      away from complimentary shipping.
                    </p>
                  ) : (
                    <p className="text-[0.72rem] font-medium leading-relaxed text-forest">
                      Complimentary shipping has been applied.
                    </p>
                  )}
                  <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-bright transition-[width] duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
                  <ul className="space-y-5">
                    {cart.map((line) => (
                      <li
                        key={`${line.productId}-${line.variant}`}
                        className="flex gap-3.5"
                      >
                        <Link
                          href={`/product/${line.slug}`}
                          onClick={closeCart}
                          className="relative block h-[104px] w-[80px] shrink-0 overflow-hidden bg-light"
                        >
                          <Image
                            src={line.image || "/images/fallback-product.webp"}
                            alt={line.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/product/${line.slug}`}
                                onClick={closeCart}
                                className="block font-display text-[1.12rem] leading-snug text-ink transition hover:text-forest"
                              >
                                {line.name}
                              </Link>
                              {line.variant && (
                                <p className="mt-0.5 text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                                  {line.variant}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(line.productId, line.variant)
                              }
                              aria-label={`Remove ${line.name}`}
                              className="mt-1 shrink-0 text-forest/30 transition hover:text-wine"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                            <div className="flex h-7 items-center border border-line bg-white">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() =>
                                  updateQuantity(
                                    line.productId,
                                    line.variant,
                                    line.quantity - 1,
                                  )
                                }
                                disabled={line.quantity <= 1}
                                className="flex size-7 items-center justify-center text-forest/55 transition hover:text-forest disabled:opacity-30"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="w-7 text-center text-[0.72rem] font-semibold tabular-nums">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() =>
                                  updateQuantity(
                                    line.productId,
                                    line.variant,
                                    line.quantity + 1,
                                  )
                                }
                                disabled={line.quantity >= line.stock}
                                className="flex size-7 items-center justify-center text-forest/55 transition hover:text-forest disabled:opacity-30"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                            <p className="text-[0.82rem] font-semibold text-forest">
                              {formatPrice(line.price * line.quantity)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="shrink-0 border-t border-line bg-white px-5 py-5 sm:px-7">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-forest/60">
                      Subtotal
                    </p>
                    <p className="font-display text-2xl text-ink">
                      {formatPrice(subtotal)}
                    </p>
                  </div>
                  <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">
                    Delivery is calculated at checkout. Cash on delivery is
                    available.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="btn btn-outline"
                    >
                      View bag
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="btn btn-forest"
                    >
                      Checkout
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-forest/55 transition hover:text-forest"
                  >
                    Continue shopping <ArrowRight className="size-3" />
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
