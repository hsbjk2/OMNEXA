import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  Check,
  Inbox,
  Mail,
  Megaphone,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { markMessageHandledAction } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Audience",
  description: "Newsletter, waitlist and contact messages.",
  robots: { index: false, follow: false },
};

export default async function AdminAudiencePage() {
  await requireAdmin();

  const [
    newsletterCount,
    waitlistCount,
    newMessageCount,
    subscribers,
    waitlist,
    messages,
  ] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.waitlistEntry.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.waitlistEntry.findMany({
      include: {
        product: { select: { id: true, name: true, slug: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Relationship"
        title="Audience"
        description="Newsletter subscribers, waitlist requests and messages from the contact and wholesale forms."
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="border border-line bg-white p-4">
          <Mail className="size-4 text-forest/30" strokeWidth={1.5} />
          <p className="mt-3 font-display text-[1.7rem] leading-none">{newsletterCount}</p>
          <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-muted">
            Newsletter
          </p>
        </div>
        <div className="border border-line bg-white p-4">
          <Bell className="size-4 text-forest/30" strokeWidth={1.5} />
          <p className="mt-3 font-display text-[1.7rem] leading-none">{waitlistCount}</p>
          <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-muted">
            Waitlist
          </p>
        </div>
        <div className="border border-line bg-white p-4">
          <Inbox className="size-4 text-forest/30" strokeWidth={1.5} />
          <p className="mt-3 font-display text-[1.7rem] leading-none">{newMessageCount}</p>
          <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-muted">
            New messages
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <section className="border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-forest/35" strokeWidth={1.5} />
              <div>
                <h2 className="text-[0.85rem] font-semibold">Messages</h2>
                <p className="text-[0.64rem] text-muted">
                  Contact and wholesale enquiries
                </p>
              </div>
            </div>
            <span className="text-[0.62rem] text-muted">
              {messages.filter((message) => message.status === "NEW").length} new
            </span>
          </div>

          {messages.length === 0 ? (
            <AdminEmpty
              icon={MessageSquare}
              title="No messages yet"
              body="Messages submitted through the contact and wholesale forms appear here."
            />
          ) : (
            <ul className="divide-y divide-line">
              {messages.map((message) => (
                <li key={message.id} className="px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[0.8rem] font-semibold text-ink">
                          {message.subject}
                        </p>
                        <span
                          className={`tag ${
                            message.type === "WHOLESALE"
                              ? "tag-lime"
                              : "bg-soft"
                          }`}
                        >
                          {message.type === "WHOLESALE" ? "Wholesale" : "General"}
                        </span>
                        {message.status === "NEW" && (
                          <span className="tag tag-wine">New</span>
                        )}
                      </div>
                      <p className="mt-1 text-[0.68rem] text-muted">
                        {message.name} · {message.email}
                        {message.phone ? ` · ${message.phone}` : ""} ·{" "}
                        {formatDate(message.createdAt, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-[0.78rem] leading-relaxed text-muted">
                        {message.message}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <a
                        href={`mailto:${message.email}?subject=${encodeURIComponent(
                          `Re: ${message.subject}`,
                        )}`}
                        className="btn btn-outline px-3 py-2"
                      >
                        Reply
                      </a>
                      {message.status === "NEW" && (
                        <form action={markMessageHandledAction}>
                          <input type="hidden" name="id" value={message.id} />
                          <button
                            type="submit"
                            className="btn btn-forest px-3 py-2"
                          >
                            <Check className="size-3.5" /> Handled
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-forest/35" strokeWidth={1.5} />
                <div>
                  <h2 className="text-[0.85rem] font-semibold">Coming-soon waitlist</h2>
                  <p className="text-[0.64rem] text-muted">
                    Latest 50 requests
                  </p>
                </div>
              </div>
              <span className="text-[0.62rem] text-muted">{waitlistCount} total</span>
            </div>
            {waitlist.length === 0 ? (
              <AdminEmpty
                icon={Bell}
                title="No waitlist entries"
                body="Customers can join the waitlist from coming-soon product pages."
              />
            ) : (
              <ul className="max-h-[480px] divide-y divide-line overflow-y-auto">
                {waitlist.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[0.76rem] font-medium text-ink">
                        {entry.product.name}
                      </p>
                      <p className="truncate text-[0.64rem] text-muted">
                        {entry.email}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[0.62rem] text-muted/60">
                        {formatDate(entry.createdAt)}
                      </p>
                      {entry.notifiedAt && (
                        <p className="text-[0.55rem] uppercase tracking-[0.08em] text-bright">
                          Notified
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Megaphone className="size-4 text-forest/35" strokeWidth={1.5} />
                <div>
                  <h2 className="text-[0.85rem] font-semibold">Newsletter subscribers</h2>
                  <p className="text-[0.64rem] text-muted">Latest 50 subscribers</p>
                </div>
              </div>
              <span className="text-[0.62rem] text-muted">{newsletterCount} active</span>
            </div>
            {subscribers.length === 0 ? (
              <AdminEmpty
                icon={Mail}
                title="No subscribers yet"
                body="Subscribers from the storefront newsletter form appear here."
              />
            ) : (
              <ul className="max-h-[480px] divide-y divide-line overflow-y-auto">
                {subscribers.map((subscriber) => (
                  <li key={subscriber.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Mail className="size-3.5 shrink-0 text-forest/25" />
                      <p className="truncate text-[0.74rem] text-ink">
                        {subscriber.email}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[0.62rem] text-muted/60">
                        {formatDate(subscriber.createdAt)}
                      </p>
                      <p
                        className={`text-[0.55rem] uppercase tracking-[0.08em] ${
                          subscriber.active ? "text-bright" : "text-muted/40"
                        }`}
                      >
                        {subscriber.active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <p className="mt-4 text-[0.66rem] leading-relaxed text-muted/60">
        Email delivery is separate from collection. Connect Resend in the
        environment before sending newsletters or restock notes.{" "}
        <Link href="/admin/settings" className="underline underline-offset-2">
          Store settings
        </Link>{" "}
        control public contact and social links.
      </p>
    </div>
  );
}
