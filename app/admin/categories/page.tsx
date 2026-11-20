import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { deleteCategoryAction } from "@/app/actions/admin";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmForm } from "@/components/admin/confirm-form";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage OMNEXA product categories.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const editId = typeof params.edit === "string" ? params.edit : "";
  const notice = typeof params.status === "string" ? params.status : "";

  const [categories, editing] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    }),
    editId
      ? prisma.category.findUnique({ where: { id: editId } })
      : Promise.resolve(null),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="The six entry points into the cabinet. Categories order the storefront navigation, filters and home grid."
        actions={
          <Link href="/admin/categories" className="btn btn-outline">
            <Plus className="size-3.5" /> New category
          </Link>
        }
      />

      {notice && (
        <div className="mb-4 border border-line bg-light/70 px-4 py-2.5 text-[0.74rem] text-forest">
          {notice === "saved"
            ? "Category saved."
            : notice === "deleted"
              ? "Category removed."
              : notice === "has-products"
                ? "This category still has products. Move or delete them before removing the category."
                : "Changes saved."}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <CategoryForm
            key={editing?.id ?? "new"}
            category={
              editing
                ? {
                    id: editing.id,
                    name: editing.name,
                    slug: editing.slug,
                    description: editing.description,
                    image: editing.image,
                    sortOrder: editing.sortOrder,
                  }
                : undefined
            }
          />
        </div>

        <div className="border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-[0.85rem] font-semibold">All categories</h2>
            <p className="mt-0.5 text-[0.68rem] text-muted">
              {categories.length} categories · order follows sort order
            </p>
          </div>

          {categories.length === 0 ? (
            <AdminEmpty
              icon={Tags}
              title="No categories yet"
              body="Create your first category to start organising the catalogue."
            />
          ) : (
            <ul className="divide-y divide-line">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center"
                >
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-light">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[0.8rem] font-semibold text-ink">
                        {category.name}
                      </p>
                      <span className="rounded bg-soft px-1.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-muted/60">
                        #{category.sortOrder}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[0.66rem] text-muted">
                      /category/{category.slug} · {category._count.products}{" "}
                      {category._count.products === 1 ? "product" : "products"}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[0.66rem] text-muted/60">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/category/${category.slug}`}
                      target="_blank"
                      className="btn btn-outline px-2.5 py-2 text-[0.55rem]"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/categories?edit=${category.id}`}
                      title="Edit category"
                      className="flex size-8 items-center justify-center text-forest/35 transition hover:text-forest"
                    >
                      <Pencil className="size-3.5" />
                    </Link>
                    <ConfirmForm
                      action={deleteCategoryAction}
                      message={`Delete “${category.name}”? Categories can only be removed when they have no products.`}
                    >
                      <input type="hidden" name="id" value={category.id} />
                      <button
                        type="submit"
                        title="Delete category"
                        className="flex size-8 items-center justify-center text-forest/25 transition hover:text-wine"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </ConfirmForm>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
