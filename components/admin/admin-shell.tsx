"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Boxes,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { logoutAction } from "@/app/actions/auth";
import { cn, initials } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/audience", label: "Audience", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="space-y-0.5">
      {navItems.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 border-l-2 px-4 py-2.5 text-[0.74rem] font-medium transition",
              active
                ? "border-lime bg-white/[0.07] text-white"
                : "border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <item.icon className="size-4" strokeWidth={1.6} />
            {item.label}
            {active && (
              <span className="ml-auto size-1.5 rounded-full bg-lime" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex h-[76px] shrink-0 items-center border-b border-white/10 px-5">
        <BrandLogo tone="light" />
      </div>

      <div className="flex-1 overflow-y-auto py-5">
        <p className="px-4 pb-2 text-[0.52rem] font-bold uppercase tracking-[0.18em] text-white/25">
          Store management
        </p>
        <NavLinks onNavigate={() => setMobileOpen(false)} />

        <div className="mx-4 mt-6 border-t border-white/10 pt-4">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-[0.68rem] text-white/40 transition hover:text-lime"
          >
            View storefront
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lime font-display text-[0.8rem] text-deep">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.72rem] font-semibold text-white">
              {user.name}
            </p>
            <p className="truncate text-[0.6rem] text-white/35">{user.email}</p>
          </div>
        </div>
        <form action={logoutAction} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 border border-white/10 px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/45 transition hover:border-white/25 hover:text-white"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#f4f6f1]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] bg-deep lg:block">
        {sidebarInner}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] lg:hidden"
          >
            <button
              type="button"
              aria-label="Close admin menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-deep/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Admin menu"
              className="absolute inset-y-0 left-0 w-[270px] bg-deep"
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center text-white/50"
              >
                <X className="size-5" />
              </button>
              {sidebarInner}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-line bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open admin menu"
              className="flex size-9 items-center justify-center text-forest lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted/60">
              <Store className="size-3.5" />
              OMNEXA Admin
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-forest/50 transition hover:text-forest sm:inline-flex"
            >
              Storefront <ArrowUpRight className="size-3" />
            </Link>
            <span className="flex size-8 items-center justify-center rounded-full bg-forest text-[0.65rem] font-bold text-lime">
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
