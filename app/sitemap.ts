
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: absoluteUrl("/shop"), changeFrequency: "daily", priority: 0.9 },
  { url: absoluteUrl("/categories"), changeFrequency: "weekly", priority: 0.8 },
  {
    url: absoluteUrl("/new-arrivals"),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: absoluteUrl("/coming-soon"),
    changeFrequency: "weekly",
    priority: 0.6,
  },
  { url: absoluteUrl("/wholesale"), changeFrequency: "monthly", priority: 0.7 },
  { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/credits"), changeFrequency: "yearly", priority: 0.2 },
  {
    url: absoluteUrl("/policies/privacy"),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: absoluteUrl("/policies/terms"),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: absoluteUrl("/policies/shipping"),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: absoluteUrl("/policies/returns"),
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return [
      ...staticRoutes,
      ...categories.map((category) => ({
        url: absoluteUrl(`/category/${category.slug}`),
        lastModified: category.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...products.map((product) => ({
        url: absoluteUrl(`/product/${product.slug}`),
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch (error) {
    console.error(
      "[db] Could not build the catalogue sitemap; using static routes.",
      error,
    );
    return staticRoutes;
  }
}

