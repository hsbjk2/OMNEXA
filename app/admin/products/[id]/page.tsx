import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseStringArray } from "@/lib/utils";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Edit product",
  description: "Edit an OMNEXA product.",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function AdminEditProductPage({
  params,
}: {
  params: Params;
}) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      categories={categories}
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        details: product.details ?? "",
        categoryId: product.categoryId,
        images: parseStringArray(product.images),
        price: product.price,
        originalPrice: product.originalPrice,
        sku: product.sku,
        stock: product.stock,
        status: product.status,
        isFeatured: product.isFeatured,
        isBestSeller: product.isBestSeller,
        isNewArrival: product.isNewArrival,
        isPublished: product.isPublished,
        isDemo: product.isDemo,
        variantLabel: product.variantLabel ?? "",
        variantOptions: parseStringArray(product.variantOptions),
      }}
    />
  );
}
