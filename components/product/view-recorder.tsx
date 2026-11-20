"use client";

import { useEffect } from "react";
import { useStore } from "@/components/providers/store-provider";
import type { ProductCardData } from "@/lib/products";

export function ViewRecorder({ product }: { product: ProductCardData }) {
  const { addRecentlyViewed } = useStore();

  useEffect(() => {
    const key = `omnexa.viewed.${product.id}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Session storage may be unavailable.
    }
    addRecentlyViewed(product);
    // Record once per product per session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return null;
}
