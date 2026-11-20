"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
  columns = 4,
}: {
  products: ProductCardData[];
  className?: string;
  columns?: 3 | 4;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:gap-y-12",
        columns === 4
          ? "lg:grid-cols-4"
          : "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.6,
            delay: Math.min((index % 4) * 0.06, 0.18),
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ProductCard product={product} priority={index < 2} />
        </motion.div>
      ))}
    </div>
  );
}
