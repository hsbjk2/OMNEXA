import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Search, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatPrice, initials } from "@/lib/utils";
import { Pagination } from "@/components/shop/pagination";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Customers",
  description: "View OMNEXA customer accounts.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 20;

function param(value: string | string[] | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = param(params.q).trim().slice(0, 80);
  const page = Math.max(1, Number(param(params.page, "1")) || 1);

  const where = {
    role: "CUSTOMER",
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, customers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { orders: true, addresses: true } },
        orders: {
          where: { status: { not: "CANCELLED" } },
          select: { total: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (targetPage: number) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (targetPage > 1) next.set("page", String(targetPage));
    const query = next.toString();
    return `/admin/customers${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="People"
        title="Customers"
        description="Registered customer accounts. Guest orders are visible under Orders but do not create an account."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <form method="get" className="flex max-w-lg flex-1 gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-forest/30" />
            <label htmlFor="customer-search" className="sr-only">
              Search customers
            </label>
            <input
              id="customer-search"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Name, email or phone…"
              className="field pl-9"
            />
          </div>
          <button type="submit" className="btn btn-forest">
            Search
          </button>
          {q && (
            <Link href="/admin/customers" className="btn btn-outline">
              Reset
            </Link>
          )}
        </form>
        <p className="text-[0.66rem] uppercase tracking-[0.1em] text-muted/55">
          {total} {total === 1 ? "customer" : "customers"}
        </p>
      </div>

      <div className="border border-line bg-white">
        {customers.length === 0 ? (
          <AdminEmpty
            icon={Users}
            title="No customers match"
            body={
              q
                ? "Try a different name, email or phone number."
                : "Customer accounts will appear here after registration."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-[0.76rem]">
              <thead>
                <tr className="border-b border-line bg-soft/60 text-[0.52rem] uppercase tracking-[0.12em] text-muted/60">
                  <th className="px-4 py-2.5 font-semibold">Customer</th>
                  <th className="px-3 py-2.5 font-semibold">Joined</th>
                  <th className="px-3 py-2.5 font-semibold">Orders</th>
                  <th className="px-3 py-2.5 font-semibold">Saved addresses</th>
                  <th className="px-3 py-2.5 font-semibold">Lifetime value</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {customers.map((customer) => {
                  const spend = customer.orders.reduce(
                    (sum, order) => sum + order.total,
                    0,
                  );
                  return (
                    <tr key={customer.id} className="transition hover:bg-soft/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-light text-[0.6rem] font-bold text-forest">
                            {initials(customer.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {customer.name}
                            </p>
                            <p className="truncate text-[0.62rem] text-muted/60">
                              {customer.email}
                              {customer.phone ? ` · ${customer.phone}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/orders?q=${encodeURIComponent(customer.email)}`}
                          className="font-medium text-forest hover:text-bright"
                        >
                          {customer._count.orders}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-muted">
                        {customer._count.addresses}
                      </td>
                      <td className="px-3 py-3 font-medium">
                        {formatPrice(spend)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[0.62rem] font-medium ${
                            customer.emailVerified
                              ? "text-bright"
                              : "text-[#8a6f24]"
                          }`}
                        >
                          {customer.emailVerified ? (
                            <>
                              <BadgeCheck className="size-3" /> Verified
                            </>
                          ) : (
                            "Unverified"
                          )}
                        </span>
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
    </div>
  );
}
