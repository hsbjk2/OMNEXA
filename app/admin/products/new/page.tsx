import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New product",
  description: "Add a product to OMNEXA.",
  robots: { index: false, follow: false },
};

export default async function AdminNewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return <ProductForm categories={categories} />;
}
