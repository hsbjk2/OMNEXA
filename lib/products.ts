import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseStringArray } from "@/lib/utils";

export const productCardInclude = {
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductInclude;

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: typeof productCardInclude;
}>;

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  status: string;
  stock: number;
  isDemo: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  variantLabel: string | null;
  variantOptions: string[];
  category: { name: string; slug: string };
  createdAt: string;
};

export type ProductDetailData = ProductCardData & {
  details: string | null;
  sku: string;
  viewCount: number;
  isFeatured: boolean;
};

export function toProductCard(product: ProductWithCategory): ProductCardData {
  const images = parseStringArray(product.images);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    image: images[0] || "/images/fallback-product.webp",
    images,
    status: product.status,
    stock: product.stock,
    isDemo: product.isDemo,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    variantLabel: product.variantLabel,
    variantOptions: parseStringArray(product.variantOptions),
    category: product.category,
    createdAt: product.createdAt.toISOString(),
  };
}

export function toProductDetail(product: ProductWithCategory): ProductDetailData {
  return {
    ...toProductCard(product),
    details: product.details,
    sku: product.sku,
    viewCount: product.viewCount,
    isFeatured: product.isFeatured,
  };
}

export async function getPublishedProductsForHome() {
  const [bestSellers, newArrivals, comingSoon, featured] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, isBestSeller: true, status: { not: "COMING_SOON" } },
      include: productCardInclude,
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
    prisma.product.findMany({
      where: { isPublished: true, isNewArrival: true, status: { not: "COMING_SOON" } },
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isPublished: true, status: "COMING_SOON" },
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.product.findMany({
      where: { isPublished: true, isFeatured: true, status: "AVAILABLE" },
      include: productCardInclude,
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ]);

  return {
    bestSellers: bestSellers.map(toProductCard),
    newArrivals: newArrivals.map(toProductCard),
    comingSoon: comingSoon.map(toProductCard),
    featured: featured.map(toProductCard),
  };
}
