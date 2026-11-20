"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { ProductCard } from "@/components/product/product-card";

export function WishlistView() {
  const { wishlist, addToCart, openCart, toast } = useStore();

  const available = wishlist.filter(
    (product) => product.status === "AVAILABLE" && product.stock > 0,
  );

  function addAll() {
    for (const product of available) {
      addToCart(product, { silent: true });
    }
    toast(
      available.length === 1
        ? "The piece was added to your bag."
        : `${available.length} pieces were added to your bag.`,
    );
    openCart();
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
              <p className="eyebrow text-forest/45">Saved pieces</p>
              <h1 className="mt-3 font-display text-[clamp(2.7rem,5vw,4.2rem)] leading-[0.96] tracking-[-0.04em]">
                Your wishlist
              </h1>
            </div>
            {wishlist.length > 0 && (
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-[0.68rem] uppercase tracking-[0.14em] text-forest/50">
                  {wishlist.length} {wishlist.length === 1 ? "piece" : "pieces"}
                </p>
                {available.length > 0 && (
                  <button
                    type="button"
                    onClick={addAll}
                    className="btn btn-forest h-10"
                  >
                    <ShoppingBag className="size-3.5" /> Add available to bag
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container-page">
          {wishlist.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
                {wishlist.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
                <p className="max-w-md text-sm leading-relaxed text-muted">
                  Saved for later, kept in your account when signed in and on
                  this device otherwise.
                </p>
                <Link href="/shop" className="btn btn-outline">
                  Find more pieces <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="mx-auto flex max-w-lg flex-col items-center text-center">
              <span className="flex size-20 items-center justify-center rounded-full bg-light text-forest">
                <Heart className="size-7" strokeWidth={1.2} />
              </span>
              <p className="eyebrow mt-7 text-forest/45">Your wishlist</p>
              <h2 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.8rem)] leading-[0.96] tracking-[-0.04em]">
                Save the pieces
                <br />
                <span className="italic text-forest/65">worth returning to.</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                Tap the heart on any product to keep it here. You can move
                saved pieces to your bag whenever you are ready.
              </p>
              <Link href="/shop" className="btn btn-forest mt-7">
                Browse the collection <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
