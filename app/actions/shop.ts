"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseStringArray } from "@/lib/utils";
import {
  productCardInclude,
  toProductCard,
  type ProductCardData,
} from "@/lib/products";
import { searchQuerySchema } from "@/lib/validators";
import type { ActionState } from "@/lib/action-state";

export type ServerCartLine = {
  productId: string;
  quantity: number;
  variant: string;
};

export type ServerShopState = {
  cart: Array<
    {
      productId: string;
      slug: string;
      name: string;
      price: number;
      originalPrice: number | null;
      image: string;
      stock: number;
      status: string;
      quantity: number;
      variant: string;
    }
  >;
  wishlist: ProductCardData[];
  searchHistory: string[];
  recentlyViewed: ProductCardData[];
};

const syncSchema = z.object({
  cart: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
        variant: z.string().max(80).optional().default(""),
      }),
    )
    .max(50),
  wishlist: z.array(z.string().min(1)).max(100),
});

export async function fetchServerShopState(): Promise<ServerShopState | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [cartRows, wishlistRows, searchRows, recentRows] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: { include: productCardInclude } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: { product: { include: productCardInclude } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { query: true },
    }),
    prisma.recentlyViewed.findMany({
      where: { userId: user.id },
      include: { product: { include: productCardInclude } },
      orderBy: { viewedAt: "desc" },
      take: 8,
    }),
  ]);

  const uniqueSearch = Array.from(
    new Set(searchRows.map((row) => row.query).filter(Boolean)),
  ).slice(0, 8);

  return {
    cart: cartRows
      .filter((row) => row.product.isPublished)
      .map((row) => {
        const images = parseStringArray(row.product.images);
        return {
          productId: row.productId,
          slug: row.product.slug,
          name: row.product.name,
          price: row.product.price,
          originalPrice: row.product.originalPrice,
          image: images[0] || "",
          stock: row.product.stock,
          status: row.product.status,
          quantity: row.quantity,
          variant: row.variant,
        };
      }),
    wishlist: wishlistRows
      .filter((row) => row.product.isPublished)
      .map((row) => toProductCard(row.product)),
    searchHistory: uniqueSearch,
    recentlyViewed: recentRows.map((row) => toProductCard(row.product)),
  };
}

export async function syncShopState(input: {
  cart: ServerCartLine[];
  wishlist: string[];
}): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { status: "idle" };

  const parsed = syncSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: "Your saved bag could not be synced." };
  }

  const productIds = Array.from(
    new Set([
      ...parsed.data.cart.map((item) => item.productId),
      ...parsed.data.wishlist,
    ]),
  );

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isPublished: true },
    select: { id: true },
  });
  const validIds = new Set(products.map((product) => product.id));

  const cartMap = new Map<string, { productId: string; quantity: number; variant: string }>();
  for (const item of parsed.data.cart) {
    if (!validIds.has(item.productId)) continue;
    const variant = item.variant ?? "";
    const key = `${item.productId}::${variant}`;
    const current = cartMap.get(key);
    if (current) {
      current.quantity = Math.min(20, current.quantity + item.quantity);
    } else {
      cartMap.set(key, {
        productId: item.productId,
        quantity: Math.min(20, item.quantity),
        variant,
      });
    }
  }

  const wishlistIds = Array.from(new Set(parsed.data.wishlist)).filter((id) =>
    validIds.has(id),
  );

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { userId: user.id } });
    if (cartMap.size > 0) {
      await tx.cartItem.createMany({
        data: Array.from(cartMap.values()).map((item) => ({
          userId: user.id,
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant,
        })),
      });
    }

    await tx.wishlistItem.deleteMany({ where: { userId: user.id } });
    if (wishlistIds.length > 0) {
      await tx.wishlistItem.createMany({
        data: wishlistIds.map((productId) => ({
          userId: user.id,
          productId,
        })),
      });
    }
  });

  return { status: "success" };
}

export async function recordSearch(query: string): Promise<void> {
  const parsed = searchQuerySchema.safeParse(query);
  if (!parsed.success || parsed.data.length < 2) return;

  const user = await getCurrentUser();
  if (!user) return;

  const recent = await prisma.searchHistory.findFirst({
    where: {
      userId: user.id,
      query: parsed.data,
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
    select: { id: true },
  });
  if (recent) return;

  await prisma.searchHistory.create({
    data: { userId: user.id, query: parsed.data },
  });

  const old = await prisma.searchHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    skip: 30,
    select: { id: true },
  });
  if (old.length > 0) {
    await prisma.searchHistory.deleteMany({
      where: { id: { in: old.map((row) => row.id) } },
    });
  }
}

export async function clearSearchHistoryAction(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Please sign in to manage saved searches." };
  }
  await prisma.searchHistory.deleteMany({ where: { userId: user.id } });
  revalidatePath("/account");
  return { status: "success", message: "Search history cleared." };
}

export async function recordProductView(productId: string): Promise<void> {
  if (!productId) return;

  const user = await getCurrentUser();

  await prisma.product.update({
    where: { id: productId },
    data: { viewCount: { increment: 1 } },
    select: { id: true },
  });

  if (user) {
    await prisma.recentlyViewed.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: { viewedAt: new Date() },
      create: { userId: user.id, productId },
    });

    const old = await prisma.recentlyViewed.findMany({
      where: { userId: user.id },
      orderBy: { viewedAt: "desc" },
      skip: 20,
      select: { id: true },
    });
    if (old.length > 0) {
      await prisma.recentlyViewed.deleteMany({
        where: { id: { in: old.map((row) => row.id) } },
      });
    }
  }
}
