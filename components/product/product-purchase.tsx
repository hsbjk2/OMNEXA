"use client";

import { useState } from "react";
import {
  Check,
  ExternalLink,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { WaitlistForm } from "@/components/product/waitlist-form";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { buildProductEnquiryHref } from "@/lib/whatsapp";
import { formatPrice, isValidHttpUrl } from "@/lib/utils";
import type { ProductDetailData } from "@/lib/products";

export function ProductPurchase({
  product,
  whatsapp,
  productUrl,
  imageUrl,
}: {
  product: ProductDetailData;
  whatsapp: string;
  productUrl: string;
  imageUrl: string | null;
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [variant, setVariant] = useState(
    product.variantLabel && product.variantOptions.length > 0
      ? product.variantOptions[0]
      : "",
  );
  const [quantity, setQuantity] = useState(1);
  const wishlisted = isWishlisted(product.id);
  const comingSoon = product.status === "COMING_SOON";
  const soldOut = !comingSoon && (product.status !== "AVAILABLE" || product.stock < 1);
  const whatsappHref = buildProductEnquiryHref(whatsapp, {
    name: product.name,
    variant,
    quantity,
    price: comingSoon ? null : product.price,
    productUrl,
    imageUrl,
  });

  return (
    <div>
      {product.variantLabel && product.variantOptions.length > 0 && !comingSoon && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.15em] text-forest/60">
              {product.variantLabel}
            </p>
            <p className="text-[0.66rem] text-muted/65">{variant}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variantOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setVariant(option)}
                aria-pressed={variant === option}
                className={`border px-3.5 py-2 text-[0.72rem] transition ${
                  variant === option
                    ? "border-forest bg-forest text-white"
                    : "border-line bg-white text-forest/65 hover:border-forest/40"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {comingSoon ? (
        <div className="mt-6 border border-line bg-light/60 p-5">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-forest/60">
            Arriving soon
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            This piece is not on sale yet. Join the notification list for
            launch news — no date has been announced.
          </p>
          <div className="mt-4">
            <WaitlistForm productId={product.id} tone="light" compact />
          </div>
        </div>
      ) : soldOut ? (
        <div className="mt-6 border border-line bg-light/60 p-5">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-forest/60">
            Currently sold out
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Leave your email and we&apos;ll let you know if this piece returns.
          </p>
          <div className="mt-4">
            <WaitlistForm productId={product.id} tone="light" compact />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex h-12 items-center border border-line bg-white">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex size-11 items-center justify-center text-forest/60 transition hover:text-forest disabled:opacity-30"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-9 text-center text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) => Math.min(product.stock, value + 1))
                }
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
                className="flex size-11 items-center justify-center text-forest/60 transition hover:text-forest disabled:opacity-30"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <p className="text-[0.68rem] leading-relaxed text-muted">
              <span className="inline-flex items-center gap-1.5 font-semibold text-forest">
                <span className="size-1.5 rounded-full bg-bright" />
                In stock
              </span>
              <span className="mt-0.5 block">
                {product.stock} available in the demo catalogue
              </span>
            </p>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() =>
                addToCart(product, { quantity, variant })
              }
              className="btn btn-forest h-[52px] flex-1"
            >
              <ShoppingBag className="size-4" strokeWidth={1.6} />
              Add to bag — {formatPrice(product.price * quantity)}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label={
                wishlisted ? "Remove from wishlist" : "Save to wishlist"
              }
              aria-pressed={wishlisted}
              className={`flex size-[52px] shrink-0 items-center justify-center border transition ${
                wishlisted
                  ? "border-forest bg-forest text-lime"
                  : "border-line bg-white text-forest hover:border-forest"
              }`}
            >
              <Heart
                className={`size-5 ${wishlisted ? "fill-current" : ""}`}
                strokeWidth={1.5}
              />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[0.64rem] text-muted">
            <p className="flex items-center gap-1.5">
              <Check className="size-3.5 text-bright" /> Order on WhatsApp
            </p>
            <p className="flex items-center gap-1.5">
              <Check className="size-3.5 text-bright" /> Server-verified pricing
            </p>
          </div>
        </>
      )}

      {whatsappHref && (
        <div className="mt-4">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline h-12 w-full border-[#128c47]/30 text-[#0e743a] hover:border-[#128c47] hover:bg-[#f1f8f3]"
          >
            <WhatsAppIcon className="size-4" />
            {comingSoon
              ? "Ask about this piece"
              : soldOut
                ? "Ask about availability"
                : "Order on WhatsApp"}
          </a>
          <p className="mt-2 text-center text-[0.62rem] leading-relaxed text-muted/70">
            {comingSoon
              ? "This opens a WhatsApp enquiry. Launch details and pricing will be confirmed by the seller in chat."
              : "This opens a WhatsApp enquiry. Availability, delivery charges and payment are confirmed by the seller in chat."}
          </p>
        </div>
      )}

      {(isValidHttpUrl(product.amazonUrl ?? "") ||
        isValidHttpUrl(product.flipkartUrl ?? "")) && (
        <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
          {isValidHttpUrl(product.amazonUrl ?? "") && (
            <a
              href={product.amazonUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Buy on Amazon <ExternalLink className="size-3.5" />
            </a>
          )}
          {isValidHttpUrl(product.flipkartUrl ?? "") && (
            <a
              href={product.flipkartUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Buy on Flipkart <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
