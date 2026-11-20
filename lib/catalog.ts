import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  productCardInclude,
  toProductCard,
  type ProductCardData,
} from "@/lib/products";
import { PRICE_FILTERS, SORT_VALUES } from "@/lib/constants";

export { PRICE_FILTERS, SORT_VALUES } from "@/lib/constants";

export type CatalogQuery = {
  q?: string;
  category?: string;
  sort?: string;
  price?: string;
  stock?: string;
  page?: string;
  comingSoon?: boolean;
  newArrivals?: boolean;
  bestSellers?: boolean;
};

export type CatalogResult = {
  products: ProductCardData[];
  total: number;
  page: number;
  pageCount: number;
  perPage: number;
};

export function normalizeSort(value?: string) {
  return SORT_VALUES.includes(value as (typeof SORT_VALUES)[number])
    ? (value as (typeof SORT_VALUES)[number])
    : "popular";
}

export function normalizePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? Math.min(page, 500) : 1;
}

export async function queryCatalog(
  query: CatalogQuery,
  options: { includeComingSoon?: boolean; categorySlug?: string; perPage?: number } = {},
): Promise<CatalogResult> {
  const perPage = options.perPage ?? 12;
  const page = normalizePage(query.page);
  const sort = normalizeSort(query.sort);
  const q = query.q?.trim().slice(0, 80) || "";
  const category = options.categorySlug || query.category || "";

  const filters: Prisma.ProductWhereInput[] = [{ isPublished: true }];

  if (!options.includeComingSoon && !query.comingSoon) {
    filters.push({ status: { not: "COMING_SOON" } });
  }
  if (query.comingSoon) {
    filters.push({ status: "COMING_SOON" });
  }
  if (query.newArrivals) filters.push({ isNewArrival: true });
  if (query.bestSellers) filters.push({ isBestSeller: true });

  if (category) filters.push({ category: { slug: category } });

  if (q) {
    filters.push({
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { name: { contains: q } } },
      ],
    });
  }

  if (query.price === "under-1000") filters.push({ price: { lt: 1000 } });
  if (query.price === "1000-2000") {
    filters.push({ price: { gte: 1000, lte: 2000 } });
  }
  if (query.price === "2000-plus") filters.push({ price: { gt: 2000 } });

  if (query.stock === "in-stock") {
    filters.push({ status: "AVAILABLE", stock: { gt: 0 } });
  }

  const where: Prisma.ProductWhereInput = { AND: filters };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "newest"
      ? [{ createdAt: "desc" }]
      : sort === "price-asc"
        ? [{ price: "asc" }, { name: "asc" }]
        : sort === "price-desc"
          ? [{ price: "desc" }, { name: "asc" }]
          : [{ viewCount: "desc" }, { createdAt: "desc" }];

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return {
    products: rows.map(toProductCard),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
    perPage,
  };
}

export async function getCatalogCategories() {
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          products: {
            where: { isPublished: true, status: { not: "COMING_SOON" } },
          },
        },
      },
    },
  });

  return rows.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description,
    count: category._count.products,
  }));
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  take = 4,
) {
  const rows = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: excludeId },
      isPublished: true,
      status: { not: "COMING_SOON" },
    },
    include: productCardInclude,
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take,
  });

  if (rows.length >= take) return rows.map(toProductCard);

  const fallback = await prisma.product.findMany({
    where: {
      id: { notIn: [excludeId, ...rows.map((row) => row.id)] },
      isPublished: true,
      status: { not: "COMING_SOON" },
    },
    include: productCardInclude,
    orderBy: [{ viewCount: "desc" }],
    take: take - rows.length,
  });

  return [...rows, ...fallback].map(toProductCard);
}
