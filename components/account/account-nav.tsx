"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Home,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview", icon: Home },
  { href: "/cart", label: "My cart", icon: ShoppingBag },
  { href: "/wishlist", label: "My wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile & security", icon: UserRound },
];

export function AccountNav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account navigation" className="-mx-1 overflow-x-auto hide-scrollbar">
      <ul className="flex min-w-max gap-1 px-1 lg:min-w-0 lg:flex-col">
        {links.map((link) => {
          const active =
            link.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(link.href);
          return (
            <li key={link.href} className="lg:w-full">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap px-3.5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] transition lg:rounded-none",
                  active
                    ? "bg-forest text-white"
                    : "text-forest/65 hover:bg-light hover:text-forest",
                )}
              >
                <link.icon className="size-4" strokeWidth={1.5} />
                {link.label}
              </Link>
            </li>
          );
        })}
        {isAdmin && (
          <li className="lg:mt-2 lg:w-full lg:border-t lg:border-line lg:pt-2">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 whitespace-nowrap px-3.5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-bright transition hover:bg-light hover:text-forest"
            >
              <ShieldCheck className="size-4" strokeWidth={1.5} /> Admin panel
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
