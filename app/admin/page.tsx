import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleAlert,
  IndianRupee,
  Mail,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { orderStatusTone } from "@/lib/orders";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminSection,
  AdminStatCard,
} from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Overview",
  description: "OMNEXA store overview.",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const [
    orderCount,
    pendingOrders,
    orderValue,
    collectedValue,
    customerCount,
    productCount,
    publishedCount,
    lowStock,
    comingSoonCount,
    newMessages,
    newsletterCount,
    waitlistCount,
    recentOrders,
    lowStockProducts,
    topProducts,
    recentWeekOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.product.count({
      where: { status: "AVAILABLE", stock: { lte: 3 } },
    }),
    prisma.product.count({ where: { status: "COMING_SOON" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.waitlistEntry.count(),
    prisma.order.findMany({
      include: { items: { select: { id: true, image: true } } },
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
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, total: true },
    }),
  ]);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const rows = recentWeekOrders.filter(
      (order) => order.createdAt.toISOString().slice(0, 10) === key,
    );
    return {
      date,
      label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
      orders: rows.length,
      value: rows.reduce((sum, row) => sum + row.total, 0),
    };
  });
  const weekMax = Math.max(1, ...days.map((day) => day.orders));
  const weekTotal = days.reduce((sum, day) => sum + day.orders, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Store overview"
        title="Good to see you."
        description="A live view of orders, stock and the audience behind OMNEXA. Every figure here comes from the store database."
        actions={
          <>
            <Link href="/admin/products/new" className="btn btn-forest">
              Add product
            </Link>
            <Link href="/admin/orders" className="btn btn-outline">
              Manage orders
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminStatCard
          label="Order value"
          value={formatPrice(orderValue._sum.total ?? 0)}
          hint={`${orderCount} orders · excludes cancelled`}
          icon={IndianRupee}
          tone="lime"
        />
        <AdminStatCard
          label="Cash collected"
          value={formatPrice(collectedValue._sum.total ?? 0)}
          hint="Orders marked paid"
          icon={TrendingUp}
        />
        <AdminStatCard
          label="Pending orders"
          value={pendingOrders}
          hint="Awaiting confirmation"
          icon={ShoppingCart}
          tone={pendingOrders > 0 ? "warn" : "default"}
        />
        <AdminStatCard
          label="Customers"
          value={customerCount}
          hint="Registered customer accounts"
          icon={Users}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminStatCard
          label="Products"
          value={`${publishedCount}/${productCount}`}
          hint="Published / total catalogue"
          icon={Boxes}
        />
        <AdminStatCard
          label="Low stock"
          value={lowStock}
          hint="Available with 3 units or fewer"
          icon={AlertTriangle}
          tone={lowStock > 0 ? "warn" : "default"}
        />
        <AdminStatCard
          label="Coming soon"
          value={comingSoonCount}
          hint="Pieces waiting to launch"
          icon={Sparkles}
        />
        <AdminStatCard
          label="New messages"
          value={newMessages}
          hint={`${newsletterCount} newsletter subscribers`}
          icon={Mail}
          tone={newMessages > 0 ? "warn" : "default"}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.55fr]">
        <AdminSection
          title="Recent orders"
          description="The latest orders across the store."
          action={
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest/55 transition hover:text-forest"
            >
              All orders <ArrowRight className="size-3" />
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <AdminEmpty
              icon={Package}
              title="No orders yet"
              body="Orders will appear here as customers check out."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-[0.76rem]">
                <thead>
                  <tr className="border-b border-line bg-soft/60 text-[0.54rem] uppercase tracking-[0.12em] text-muted/60">
                    <th className="px-5 py-2.5 font-semibold">Order</th>
                    <th className="px-3 py-2.5 font-semibold">Customer</th>
                    <th className="px-3 py-2.5 font-semibold">Date</th>
                    <th className="px-3 py-2.5 font-semibold">Status</th>
                    <th className="px-5 py-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-soft/60">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-semibold text-forest transition hover:text-bright"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-[0.62rem] text-muted/60">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "line" : "lines"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-ink">{order.customerName}</p>
                        <p className="text-[0.62rem] text-muted/60">{order.email}</p>
                      </td>
                      <td className="px-3 py-3 text-muted">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`tag ${orderStatusTone(order.status)}`}>
                          {ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                            order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        {formatPrice(order.total)}
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
            description="Stock and inbox items to review."
          >
            <div className="divide-y divide-line">
              <Link
                href="/admin/products?stock=low"
                className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-soft/60"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="size-4 text-[#8a6f24]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[0.76rem] font-medium text-ink">Low stock</p>
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
                  <Mail className="size-4 text-forest/35" strokeWidth={1.5} />
                  <div>
                    <p className="text-[0.76rem] font-medium text-ink">Contact messages</p>
                    <p className="text-[0.62rem] text-muted">Awaiting a reply</p>
                  </div>
                </div>
                <span className="font-display text-[1.2rem]">{newMessages}</span>
              </Link>
              <Link
                href="/admin/audience"
                className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-soft/60"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="size-4 text-forest/35" strokeWidth={1.5} />
                  <div>
                    <p className="text-[0.76rem] font-medium text-ink">Waitlist entries</p>
                    <p className="text-[0.62rem] text-muted">Across coming-soon pieces</p>
                  </div>
                </div>
                <span className="font-display text-[1.2rem]">{waitlistCount}</span>
              </Link>
            </div>
          </AdminSection>

          <AdminSection
            title="Last 7 days"
            description={`${weekTotal} ${weekTotal === 1 ? "order" : "orders"} this week.`}
          >
            <div className="flex h-36 items-end gap-2 px-5 pb-3 pt-6">
              {days.map((day) => (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-24 w-full items-end">
                    <div
                      className="w-full bg-forest/15 transition hover:bg-bright"
                      style={{
                        height: `${Math.max(4, (day.orders / weekMax) * 100)}%`,
                      }}
                      title={`${day.orders} order${day.orders === 1 ? "" : "s"} · ${formatPrice(day.value)}`}
                    />
                  </div>
                  <span className="text-[0.54rem] uppercase tracking-[0.08em] text-muted/60">
                    {day.label}
                  </span>
                </div>
              ))}
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
                  <span className="text-[0.7rem] text-muted">
                    {product.viewCount} views
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
              Demo catalogue notice: seeded products, prices and stock are
              demonstration data, clearly flagged in the storefront. Replace
              them with real merchandise before publishing the store.
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
