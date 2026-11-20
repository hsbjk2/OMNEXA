"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, ArrowUpRight } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductCardData } from "@/lib/products";

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductCardData;
  priority?: boolean;
  className?: string;
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);
  const soldOut = product.status !== "AVAILABLE" || product.stock < 1;
  const comingSoon = product.status === "COMING_SOON";

  const badge = comingSoon
    ? "Coming soon"
    : soldOut
      ? "Sold out"
      : product.isNewArrival
        ? "New in"
        : product.isBestSeller
          ? "Best seller"
          : null;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-light">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.name}`}
        >
          <Image
            src={product.image || "/images/fallback-product.webp"}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-deep/20 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col items-start gap-1.5">
          {badge && (
            <span
              className={cn(
                "inline-flex items-center rounded-[1px] px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.13em]",
                badge === "New in"
                  ? "bg-lime text-deep"
                  : comingSoon
                    ? "bg-forest text-white"
                    : "bg-white/92 text-forest backdrop-blur-sm",
              )}
            >
              {badge}
            </span>
          )}
          {product.isDemo && (
            <span className="inline-flex items-center rounded-[1px] bg-white/75 px-2 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-forest/55 backdrop-blur-sm">
              Demo
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full bg-white/88 text-forest shadow-sm backdrop-blur-sm transition hover:bg-white sm:size-9"
        >
          <Heart
            className={cn(
              "size-3.5 transition",
              wishlisted && "fill-forest text-forest",
            )}
            strokeWidth={1.6}
          />
        </button>

        <div className="absolute inset-x-2 bottom-2 z-20 translate-y-0 opacity-100 transition-all duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          {comingSoon ? (
            <Link
              href={`/product/${product.slug}`}
              className="flex w-full items-center justify-between bg-white/95 px-3 py-3 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-forest backdrop-blur-sm transition hover:bg-lime"
            >
              Notify me <ArrowUpRight className="size-3.5" />
            </Link>
          ) : soldOut ? (
            <Link
              href={`/product/${product.slug}`}
              className="flex w-full items-center justify-between bg-white/95 px-3 py-3 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-forest backdrop-blur-sm transition hover:bg-lime"
            >
              View piece <ArrowUpRight className="size-3.5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="flex w-full items-center justify-between bg-white/95 px-3 py-3 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-forest backdrop-blur-sm transition hover:bg-lime"
            >
              Add to bag <Plus className="size-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[0.57rem] font-semibold uppercase leading-none tracking-[0.16em] text-forest/45">
          {product.category.name}
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.2rem] leading-[1.15] text-ink sm:text-[1.3rem]">
            <Link
              href={`/product/${product.slug}`}
              className="transition-colors hover:text-forest"
            >
              {product.name}
            </Link>
          </h3>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[0.82rem] font-semibold tracking-wide text-forest">
            {comingSoon ? "Launching soon" : formatPrice(product.price)}
          </span>
          {!comingSoon &&
            product.originalPrice &&
            product.originalPrice > product.price && (
              <span className="text-[0.72rem] text-muted/65 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          {product.variantLabel && product.variantOptions.length > 0 && (
            <span className="ml-auto text-[0.6rem] uppercase tracking-[0.1em] text-muted/60">
              {product.variantOptions.length} options
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
