import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, LogOut, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { initials } from "@/lib/utils";
import { AccountNav } from "@/components/account/account-nav";
import { VerificationBanner } from "@/components/account/verification-banner";

export const metadata: Metadata = {
  title: {
    default: "Your account",
    template: "%s · OMNEXA",
  },
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/account");
  const firstName = user.name.split(" ")[0] || user.name;

  return (
    <>
      <section className="relative overflow-hidden bg-deep text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,217,22,0.12),transparent_55%)]" />
        <div className="container-page relative z-10 py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-white/40">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-white/70">Account</span>
          </nav>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-lime">Your OMNEXA</p>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.2rem)] leading-[0.95] tracking-[-0.04em]">
                Hello, <span className="italic text-lime">{firstName}.</span>
              </h1>
              <p className="mt-3 max-w-lg text-[0.86rem] leading-relaxed text-white/50">
                Your saved pieces, delivery details, browsing history and
                account preferences — gathered in one quiet place.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.14em] text-white/35">
              <Sparkles className="size-3.5 text-lime/70" />
              Member since {new Date(user.createdAt).getFullYear()}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container-page grid gap-8 py-9 sm:py-12 lg:grid-cols-[250px_1fr] lg:gap-14 lg:py-16">
          <aside className="min-w-0">
            <div className="border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest font-display text-lg text-lime">
                  {initials(user.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.85rem] font-semibold text-ink">
                    {user.name}
                  </p>
                  <p className="truncate text-[0.7rem] text-muted">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-line pt-3">
                <p className="flex items-center justify-between text-[0.62rem] uppercase tracking-[0.1em] text-muted/60">
                  Account status
                  <span
                    className={
                      user.emailVerified
                        ? "font-bold text-bright"
                        : "font-bold text-[#8a6f24]"
                    }
                  >
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-3 hidden lg:block">
              <AccountNav isAdmin={user.role === "ADMIN"} />
            </div>
            <div className="mt-3 lg:hidden">
              <AccountNav isAdmin={user.role === "ADMIN"} />
            </div>

            <form action={logoutAction} className="mt-3 hidden lg:block">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 px-3.5 py-3 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-muted transition hover:text-wine"
              >
                <LogOut className="size-4" strokeWidth={1.5} /> Sign out
              </button>
            </form>
            <form action={logoutAction} className="mt-4 lg:hidden">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted transition hover:text-wine"
              >
                <LogOut className="size-3.5" strokeWidth={1.5} /> Sign out
              </button>
            </form>
          </aside>

          <div className="min-w-0">
            {!user.emailVerified && (
              <div className="mb-6">
                <VerificationBanner email={user.email} />
              </div>
            )}
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
