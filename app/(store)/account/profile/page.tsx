import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  LogOut,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { formatDate } from "@/lib/utils";
import { ProfileForms } from "@/components/account/profile-forms";

export const metadata: Metadata = {
  title: "Profile & security",
  description: "Manage your OMNEXA profile and security.",
  robots: { index: false, follow: false },
};

export default async function AccountProfilePage() {
  const user = await requireUser("/account/profile");
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  return (
    <div>
      <div>
        <p className="eyebrow text-forest/45">Your details</p>
        <h2 className="mt-2 font-display text-[2rem] leading-tight sm:text-[2.4rem]">
          Profile &amp; security.
        </h2>
        <p className="mt-2 max-w-xl text-[0.82rem] leading-relaxed text-muted">
          Keep your contact details current and your account protected. Your
          password is stored as a secure hash and is never kept in the browser.
        </p>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="order-2 xl:order-1">
          <ProfileForms user={user} hasPassword={Boolean(record?.passwordHash)} />
        </div>

        <div className="order-1 space-y-5 xl:order-2">
          <section className="border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <p className="eyebrow text-forest/45">Account summary</p>
            </div>
            <dl className="divide-y divide-line px-5 text-[0.78rem]">
              <div className="flex items-start gap-3 py-3.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-forest/35" strokeWidth={1.5} />
                <div className="min-w-0">
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted/60">
                    Email
                  </dt>
                  <dd className="mt-0.5 break-all text-ink">{user.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3.5">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-forest/35" strokeWidth={1.5} />
                <div>
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted/60">
                    Verification
                  </dt>
                  <dd className={`mt-0.5 font-medium ${user.emailVerified ? "text-bright" : "text-[#8a6f24]"}`}>
                    {user.emailVerified
                      ? `Verified ${formatDate(user.emailVerified)}`
                      : "Email not verified"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3.5">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-forest/35" strokeWidth={1.5} />
                <div>
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted/60">
                    Member since
                  </dt>
                  <dd className="mt-0.5 text-ink">{formatDate(user.createdAt)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest/35" strokeWidth={1.5} />
                <div>
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted/60">
                    Account type
                  </dt>
                  <dd className="mt-0.5 text-ink">
                    {user.role === "ADMIN" ? "Administrator" : "Customer"}
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          <section className="border border-line bg-white p-5">
            <p className="eyebrow text-forest/45">Privacy</p>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-muted">
              You control your saved data. Clear your search suggestions here, or
              read how we handle your details.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <Link
                href="/policies/privacy"
                className="inline-flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-forest/55 transition hover:text-forest"
              >
                Privacy policy <ArrowRight className="size-3" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-forest/55 transition hover:text-forest"
              >
                Request data help <ArrowRight className="size-3" />
              </Link>
            </div>
          </section>

          <section className="border border-line bg-white p-5">
            <p className="eyebrow text-forest/45">Session</p>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-muted">
              Sign out of this browser. Your bag and wishlist remain saved to
              your account.
            </p>
            <form action={logoutAction} className="mt-3">
              <button type="submit" className="btn btn-outline">
                <LogOut className="size-3.5" /> Sign out
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
