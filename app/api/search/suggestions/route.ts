import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseStringArray, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().slice(0, 80);

  if (query.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } },
          { variantOptions: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        status: true,
        isDemo: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ isBestSeller: "desc" }, { viewCount: "desc" }],
      take: 6,
    }),
    prisma.category.findMany({
      where: { name: { contains: query } },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
  ]);

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: truncate(product.name, 60),
      slug: product.slug,
      price: product.price,
      image: parseStringArray(product.images)[0] || "/images/fallback-product.webp",
      category: product.category.name,
      status: product.status,
      isDemo: product.isDemo,
    })),
    categories,
  });
}
