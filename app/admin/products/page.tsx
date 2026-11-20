import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  Eye,
  EyeOff,
  Package,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  deleteProductAction,
  toggleProductFlagAction,
} from "@/app/actions/admin";
import {
  PRODUCT_STATUS_LABELS,
  type ProductStatus,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { Pagination } from "@/components/shop/pagination";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/ui";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products",
  description: "Manage the OMNEXA product catalogue.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 15;

function param(value: string | string[] | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function statusTone(status: string, published: boolean) {
  if (!published) return "bg-[#f1f1ee] text-muted";
  if (status === "AVAILABLE") return "bg-[#e7f2e9] text-forest";
  if (status === "COMING_SOON") return "bg-[#f4efe1] text-[#6c5626]";
  return "bg-[#f3e4e4] text-wine";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = param(params.q).trim().slice(0, 80);
  const status = param(params.status);
  const category = param(params.category);
  const stock = param(params.stock);
  const page = Math.max(1, Number(param(params.page, "1")) || 1);
  const notice = param(params.notice);

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { category: { name: { contains: q } } },
          ],
        }
      : {}),
    ...(status === "hidden"
      ? { isPublished: false }
      : status && ["AVAILABLE", "OUT_OF_STOCK", "COMING_SOON"].includes(status)
        ? { status }
        : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(stock === "low"
      ? { stock: { lte: 3 }, status: "AVAILABLE" }
      : stock === "out"
        ? { stock: 0, status: { not: "COMING_SOON" } }
        : {}),
  };

  const [total, categories, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (targetPage: number) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (status) next.set("status", status);
    if (category) next.set("category", category);
    if (stock) next.set("stock", stock);
    if (targetPage > 1) next.set("page", String(targetPage));
    const query = next.toString();
    return `/admin/products${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Create, edit and publish pieces across the storefront. Demo products are flagged so customers always know what they are viewing."
        actions={
          <Link href="/admin/products/new" className="btn btn-forest">
            <Plus className="size-3.5" /> Add product
          </Link>
        }
      />

      {notice && (
        <div className="mb-4 border border-line bg-light/70 px-4 py-2.5 text-[0.74rem] text-forest">
          {notice === "deleted"
            ? "Product removed."
            : notice === "created"
              ? "Product created."
              : notice === "updated"
                ? "Product updated."
                : "Changes saved."}
        </div>
      )}

      <form
        method="get"
        className="mb-4 flex flex-col gap-2 border border-line bg-white p-3.5 sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="q" className="field-label">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-forest/30" />
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Name, SKU or category…"
              className="field pl-9"
            />
          </div>
        </div>
        <div className="sm:w-40">
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <select id="status" name="status" defaultValue={status} className="field">
            <option value="">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
            <option value="COMING_SOON">Coming soon</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <div className="sm:w-44">
          <label htmlFor="category" className="field-label">
            Category
          </label>
          <select id="category" name="category" defaultValue={category} className="field">
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:w-36">
          <label htmlFor="stock" className="field-label">
            Stock
          </label>
          <select id="stock" name="stock" defaultValue={stock} className="field">
            <option value="">Any</option>
            <option value="low">Low (≤3)</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-forest">
            Filter
          </button>
          <Link href="/admin/products" className="btn btn-outline">
            Reset
          </Link>
        </div>
      </form>

      <div className="border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[0.7rem] text-muted">
            <span className="font-semibold text-ink">{total}</span>{" "}
            {total === 1 ? "product" : "products"}
            {q ? ` matching “${q}”` : ""}
          </p>
          <p className="text-[0.6rem] uppercase tracking-[0.1em] text-muted/50">
            Sorted by latest update
          </p>
        </div>

        {products.length === 0 ? (
          <AdminEmpty
            icon={Boxes}
            title="No products found"
            body="Adjust the filters or add a new product to the catalogue."
            action={
              <Link href="/admin/products/new" className="btn btn-forest">
                Add product
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-[0.76rem]">
              <thead>
                <tr className="border-b border-line bg-soft/60 text-[0.52rem] uppercase tracking-[0.12em] text-muted/60">
                  <th className="px-4 py-2.5 font-semibold">Product</th>
                  <th className="px-3 py-2.5 font-semibold">Category</th>
                  <th className="px-3 py-2.5 font-semibold">Price</th>
                  <th className="px-3 py-2.5 font-semibold">Stock</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">Flags</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((product) => {
                  const images = (() => {
                    try {
                      const parsed = JSON.parse(product.images);
                      return Array.isArray(parsed) ? parsed : [];
                    } catch {
                      return [];
                    }
                  })();
                  return (
                    <tr key={product.id} className="align-middle transition hover:bg-soft/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 overflow-hidden bg-light">
                            <Image
                              src={images[0] || "/images/fallback-product.webp"}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="line-clamp-1 font-medium text-ink transition hover:text-forest"
                            >
                              {product.name}
                            </Link>
                            <p className="mt-0.5 flex items-center gap-2 text-[0.62rem] text-muted/60">
                              {product.sku}
                              {product.isDemo && (
                                <span className="rounded bg-light px-1.5 py-px text-[0.5rem] font-bold uppercase tracking-[0.08em] text-forest/55">
                                  Demo
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted">
                        {product.category.name}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-ink">
                          {formatPrice(product.price)}
                        </p>
                        {product.originalPrice && (
                          <p className="text-[0.62rem] text-muted/50 line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "font-medium",
                            product.stock === 0
                              ? "text-wine"
                              : product.stock <= 3
                                ? "text-[#8a6f24]"
                                : "text-ink",
                          )}
                        >
                          {product.status === "COMING_SOON"
                            ? "—"
                            : product.stock}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`tag ${statusTone(product.status, product.isPublished)}`}
                        >
                          {!product.isPublished
                            ? "Hidden"
                            : (PRODUCT_STATUS_LABELS[
                                product.status as ProductStatus
                              ] ?? product.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {(
                            [
                              { flag: "isFeatured", label: "Featured", icon: Star },
                              { flag: "isBestSeller", label: "Best seller", icon: TrendingUp },
                              { flag: "isNewArrival", label: "New arrival", icon: Sparkles },
                              {
                                flag: "isPublished",
                                label: "Published",
                                icon: product.isPublished ? Eye : EyeOff,
                              },
                            ] as const
                          ).map((item) => {
                            const active = Boolean(product[item.flag]);
                            return (
                              <form key={item.flag} action={toggleProductFlagAction}>
                                <input type="hidden" name="id" value={product.id} />
                                <input type="hidden" name="flag" value={item.flag} />
                                <button
                                  type="submit"
                                  title={`${active ? "Disable" : "Enable"} ${item.label.toLowerCase()}`}
                                  aria-label={`${active ? "Disable" : "Enable"} ${item.label.toLowerCase()} for ${product.name}`}
                                  aria-pressed={active}
                                  className={cn(
                                    "flex size-7 items-center justify-center border transition",
                                    active
                                      ? "border-forest bg-forest text-lime"
                                      : "border-line text-forest/25 hover:border-forest/40 hover:text-forest/60",
                                  )}
                                >
                                  <item.icon className="size-3" />
                                </button>
                              </form>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            title="View on storefront"
                            className="flex size-7 items-center justify-center text-forest/35 transition hover:text-forest"
                          >
                            <Eye className="size-3.5" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}`}
                            title="Edit product"
                            className="flex size-7 items-center justify-center text-forest/35 transition hover:text-forest"
                          >
                            <Pencil className="size-3.5" />
                          </Link>
                          <ConfirmForm
                            action={deleteProductAction}
                            message={`Delete “${product.name}”? This also removes it from carts, wishlists and waitlists. Existing order records keep their snapshot.`}
                          >
                            <input type="hidden" name="id" value={product.id} />
                            <button
                              type="submit"
                              title="Delete product"
                              className="flex size-7 items-center justify-center text-forest/25 transition hover:text-wine"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </ConfirmForm>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <Pagination
          page={page}
          pageCount={pageCount}
          buildHref={(nextPage) => buildHref(nextPage)}
        />
      )}

      <p className="mt-4 flex items-start gap-2 text-[0.68rem] leading-relaxed text-muted/70">
        <Package className="mt-0.5 size-3.5 shrink-0" />
        Products with stock set to zero are marked out of stock automatically.
        Coming-soon pieces are excluded from the bag and use the waitlist.
      </p>
    </div>
  );
}
