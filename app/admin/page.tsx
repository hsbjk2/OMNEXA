import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleAlert,
  Eye,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  PRODUCT_STATUS_LABELS,
  type ProductStatus,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminSection,
  AdminStatCard,
} from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Overview",
  description: "OMNEXA catalogue and audience overview.",
  robots: { index: false, follow: false },
};

function statusTone(status: string, stock: number) {
  if (status === "AVAILABLE" && stock > 0) return "bg-[#e7f2e9] text-forest";
  if (status === "COMING_SOON") return "bg-[#f4efe1] text-[#6c5626]";
  return "bg-[#f3e4e4] text-wine";
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    productCount,
    publishedCount,
    lowStock,
    comingSoonCount,
    customerCount,
    cartValue,
    wishlistCount,
    addressCount,
    newMessages,
    newsletterCount,
    waitlistCount,
    categories,
    recentProducts,
    lowStockProducts,
    topProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.product.count({
      where: { status: "AVAILABLE", stock: { lte: 3 } },
    }),
    prisma.product.count({ where: { status: "COMING_SOON" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.cartItem.aggregate({
      where: { product: { isPublished: true } },
      _sum: { quantity: true },
    }),
    prisma.wishlistItem.count({ where: { product: { isPublished: true } } }),
    prisma.address.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.waitlistEntry.count(),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
    }),
    prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: { status: "AVAILABLE", stock: { lte: 3 } },
      include: { category: { select: { name: true } } },
      orderBy: { stock: "asc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        name: true,
        slug: true,
        viewCount: true,
        category: { select: { name: true } },
      },
      orderBy: { viewCount: "desc" },
      take: 5,
    }),
  ]);

  const savedBagPieces = cartValue._sum.quantity ?? 0;
  const categoryTotal = Math.max(
    1,
    categories.reduce((sum, category) => sum + category._count.products, 0),
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue overview"
        title="Good to see you."
        description="A live view of the catalogue, saved customer activity and the audience behind OMNEXA. Purchases are completed as WhatsApp enquiries, so there are no orders or payments to process here."
        actions={
          <>
            <Link href="/admin/products/new" className="btn btn-forest">
              Add product
            </Link>
            <Link href="/admin/settings" className="btn btn-outline">
              Store settings
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminStatCard
          label="Published catalogue"
          value={`${publishedCount}/${productCount}`}
          hint="Published / total products"
          icon={Boxes}
          tone="lime"
        />
        <AdminStatCard
          label="Low stock"
          value={lowStock}
          hint="Available with 3 units or fewer"
          icon={AlertTriangle}
          tone={lowStock > 0 ? "warn" : "default"}
        />
        <AdminStatCard
          label="Customers"
          value={customerCount}
          hint="Registered customer accounts"
          icon={Users}
        />
        <AdminStatCard
          label="Saved bag pieces"
          value={savedBagPieces}
          hint="Across signed-in customer bags"
          icon={ShoppingBag}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminStatCard
          label="Wishlist saves"
          value={wishlistCount}
          hint="Products saved for later"
          icon={Heart}
        />
        <AdminStatCard
          label="Saved addresses"
          value={addressCount}
          hint="Delivery details on file"
          icon={MapPin}
        />
        <AdminStatCard
          label="New messages"
          value={newMessages}
          hint={`${newsletterCount} newsletter subscribers`}
          icon={Mail}
          tone={newMessages > 0 ? "warn" : "default"}
        />
        <AdminStatCard
          label="Coming soon"
          value={comingSoonCount}
          hint={`${waitlistCount} waitlist ${
            waitlistCount === 1 ? "entry" : "entries"
          }`}
          icon={Sparkles}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.55fr]">
        <AdminSection
          title="Newest catalogue additions"
          description="The latest products added to the storefront."
          action={
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest/55 transition hover:text-forest"
            >
              All products <ArrowRight className="size-3" />
            </Link>
          }
        >
          {recentProducts.length === 0 ? (
            <AdminEmpty
              icon={Boxes}
              title="No products yet"
              body="Add your first product to start building the catalogue."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-[0.76rem]">
                <thead>
                  <tr className="border-b border-line bg-soft/60 text-[0.54rem] uppercase tracking-[0.12em] text-muted/60">
                    <th className="px-5 py-2.5 font-semibold">Product</th>
                    <th className="px-3 py-2.5 font-semibold">Category</th>
                    <th className="px-3 py-2.5 font-semibold">Price</th>
                    <th className="px-3 py-2.5 font-semibold">Availability</th>
                    <th className="px-5 py-2.5 text-right font-semibold">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recentProducts.map((product) => (
                    <tr key={product.id} className="transition hover:bg-soft/60">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-semibold text-forest transition hover:text-bright"
                        >
                          {product.name}
                        </Link>
                        <p className="text-[0.62rem] text-muted/60">
                          {product.isPublished ? "Published" : "Hidden"} ·{" "}
                          {product.sku}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-muted">
                        {product.category.name}
                      </td>
                      <td className="px-3 py-3 font-medium">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`tag ${statusTone(product.status, product.stock)}`}
                        >
                          {PRODUCT_STATUS_LABELS[
                            product.status as ProductStatus
                          ] ?? product.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        {product.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminSection>

        <div className="space-y-5">
          <AdminSection
            title="Needs attention"
            description="Catalogue and inbox items to review."
          >
            <div className="divide-y divide-line">
              <Link
                href="/admin/products?stock=low"
                className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-soft/60"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle
                    className="size-4 text-[#8a6f24]"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="text-[0.76rem] font-medium text-ink">
                      Low stock
                    </p>
                    <p className="text-[0.62rem] text-muted">3 units or fewer</p>
                  </div>
                </div>
                <span className="font-display text-[1.2rem]">{lowStock}</span>
              </Link>
              <Link
                href="/admin/audience"
                className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-soft/60"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare
                    className="size-4 text-forest/35"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="text-[0.76rem] font-medium text-ink">
                      Contact messages
                    </p>
                    <p className="text-[0.62rem] text-muted">
                      Awaiting a reply
                    </p>
                  </div>
                </div>
                <span className="font-display text-[1.2rem]">
                  {newMessages}
                </span>
              </Link>
              <Link
                href="/admin/audience"
                className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-soft/60"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles
                    className="size-4 text-forest/35"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="text-[0.76rem] font-medium text-ink">
                      Waitlist entries
                    </p>
                    <p className="text-[0.62rem] text-muted">
                      Across coming-soon pieces
                    </p>
                  </div>
                </div>
                <span className="font-display text-[1.2rem]">
                  {waitlistCount}
                </span>
              </Link>
            </div>
          </AdminSection>

          <AdminSection
            title="Catalogue spread"
            description={`${publishedCount} published ${
              publishedCount === 1 ? "product" : "products"
            } across ${categories.length} ${
              categories.length === 1 ? "category" : "categories"
            }.`}
          >
            <div className="space-y-3 px-5 py-5">
              {categories.length === 0 ? (
                <p className="text-[0.76rem] text-muted">
                  No categories created yet.
                </p>
              ) : (
                categories.slice(0, 6).map((category) => (
                  <div key={category.id}>
                    <div className="flex items-center justify-between text-[0.68rem]">
                      <span className="text-ink">{category.name}</span>
                      <span className="text-muted">
                        {category._count.products}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-forest/45 transition hover:bg-bright"
                        style={{
                          width: `${Math.max(
                            4,
                            (category._count.products / categoryTotal) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminSection>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <AdminSection
          title="Low stock"
          description="Published pieces nearing the end of their run."
          action={
            <Link
              href="/admin/products?stock=low"
              className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest/55 transition hover:text-forest"
            >
              Review
            </Link>
          }
        >
          {lowStockProducts.length === 0 ? (
            <AdminEmpty
              icon={AlertTriangle}
              title="Stock looks healthy"
              body="No available products are at three units or fewer."
            />
          ) : (
            <ul className="divide-y divide-line">
              {lowStockProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-soft/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.76rem] font-medium text-ink">
                        {product.name}
                      </p>
                      <p className="text-[0.62rem] text-muted">
                        {product.category.name} · SKU {product.sku}
                      </p>
                    </div>
                    <span
                      className={`text-[0.72rem] font-bold ${
                        product.stock === 0 ? "text-wine" : "text-[#8a6f24]"
                      }`}
                    >
                      {product.stock} left
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>

        <AdminSection
          title="Most viewed"
          description="Based on recorded product page views."
          action={
            <Link
              href="/admin/products"
              className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest/55 transition hover:text-forest"
            >
              Catalogue
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {topProducts.map((product, index) => (
              <li key={product.id}>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-soft/60"
                >
                  <span className="w-5 text-[0.6rem] font-bold text-forest/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.76rem] font-medium text-ink">
                      {product.name}
                    </p>
                    <p className="text-[0.62rem] text-muted">
                      {product.category.name}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[0.7rem] text-muted">
                    <Eye className="size-3" /> {product.viewCount}
                  </span>
                </Link>
              </li>
            ))}
            {topProducts.length === 0 && (
              <li className="px-5 py-8 text-center text-[0.76rem] text-muted">
                No product views recorded yet.
              </li>
            )}
          </ul>
        </AdminSection>
      </div>

      <div className="mt-5 border border-line bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-forest/35" />
            <p className="max-w-3xl text-[0.7rem] leading-relaxed text-muted">
              Catalogue and audience metrics only. OMNEXA does not process
              payments or confirm orders on this website — customers send a
              product enquiry and the seller continues the conversation on
              WhatsApp.
            </p>
          </div>
          <Link
            href="/admin/settings"
            className="shrink-0 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest/55 transition hover:text-forest"
          >
            Store settings
          </Link>
        </div>
      </div>
    </div>
  );
}
