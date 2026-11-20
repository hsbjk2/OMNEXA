"use client";

import { useStore } from "@/components/providers/store-provider";
import { ProductCard } from "@/components/product/product-card";

export function RecentlyViewedRail({ excludeId }: { excludeId: string }) {
  const { recentlyViewed } = useStore();
  const items = recentlyViewed.filter((item) => item.id !== excludeId).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="border-t border-line bg-cream">
      <div className="container-page py-14 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-forest/45">Your session</p>
            <h2 className="title-md mt-2">Recently viewed</h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
