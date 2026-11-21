import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/components/site/social-icons";
import { POLICY_LINKS, SITE_DESCRIPTION } from "@/lib/constants";
import type { StoreSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import type { ShippingConfig } from "@/lib/shipping";

type Category = { id: string; name: string; slug: string };

export function Footer({
  settings,
  categories,
  shipping,
}: {
  settings: StoreSettings;
  categories: Category[];
  shipping: ShippingConfig;
}) {
  const year = new Date().getFullYear();
  const demoEmail = settings.contactEmail.endsWith(".example");
  const whatsappHref =
    buildWhatsAppHref(
      settings.whatsapp,
      "Hi OMNEXA! I would like to enquire about your products and get further details.",
    ) ?? "";

  return (
    <footer className="relative overflow-hidden bg-deep text-white">
      <div className="container-page relative z-10 pt-16 pb-24 sm:pt-20 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1.1fr] lg:gap-10">
          <div className="max-w-sm">
            <BrandLogo tone="light" />
            <p className="mt-6 font-display text-[1.65rem] leading-[1.15] text-white/90">
              Beauty, elegance &amp; everything you love.
            </p>
            <p className="mt-4 max-w-xs text-[0.8rem] leading-relaxed text-white/50">
              Considered skincare, colour, kits and jewellery — chosen for the
              way you actually get ready.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="OMNEXA on Instagram"
                  className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/65 transition hover:border-lime hover:text-lime"
                >
                  <InstagramIcon className="size-4" />
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="OMNEXA on Facebook"
                  className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/65 transition hover:border-lime hover:text-lime"
                >
                  <FacebookIcon className="size-4" />
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Chat with OMNEXA on WhatsApp"
                  className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/65 transition hover:border-lime hover:text-lime"
                >
                  <WhatsAppIcon className="size-4" />
                </a>
              )}
              {settings.whatsappChannelUrl && (
                <a
                  href={settings.whatsappChannelUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="OMNEXA WhatsApp channel"
                  className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/65 transition hover:border-lime hover:text-lime"
                >
                  <MessageCircle className="size-4" strokeWidth={1.5} />
                </a>
              )}
              <a
                href={`mailto:${settings.contactEmail}`}
                aria-label={`Email ${settings.businessName}`}
                className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/65 transition hover:border-lime hover:text-lime"
              >
                <Mail className="size-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow text-lime">Shop</p>
            <ul className="mt-5 space-y-2.5">
              <li>
                <Link
                  href="/shop"
                  className="text-[0.82rem] text-white/60 transition hover:text-white"
                >
                  All products
                </Link>
              </li>
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-[0.82rem] text-white/60 transition hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-lime">Information</p>
            <ul className="mt-5 space-y-2.5">
              {[
                { label: "Our story", href: "/about" },
                { label: "Wholesale", href: "/wholesale" },
                { label: "Contact", href: "/contact" },
                { label: "Coming soon", href: "/coming-soon" },
                { label: "Photography credits", href: "/credits" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.82rem] text-white/60 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.82rem] text-white/60 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-lime">Visit &amp; reach us</p>
            <div className="mt-5 space-y-4 text-[0.82rem] leading-relaxed text-white/60">
              {settings.hasLocation ? (
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-lime/80" strokeWidth={1.5} />
                  <span>{settings.fullAddress}</span>
                </p>
              ) : (
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-lime/80" strokeWidth={1.5} />
                  <span>
                    Store location is being finalised. WhatsApp ordering is open.
                  </span>
                </p>
              )}

              {whatsappHref && (
                <div className="flex items-start gap-2.5">
                  <MessageCircle
                    className="mt-0.5 size-4 shrink-0 text-lime/80"
                    strokeWidth={1.5}
                  />
                  <div>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-medium text-white/80 transition hover:text-white"
                    >
                      {settings.whatsapp}
                    </a>
                    <p className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-lime/70">
                      WhatsApp · enquiries &amp; further details
                    </p>
                  </div>
                </div>
              )}

              <p className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-lime/80" strokeWidth={1.5} />
                <span>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="transition hover:text-white"
                  >
                    {settings.contactEmail}
                  </a>
                  {demoEmail && (
                    <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.13em] text-white/30">
                      Demo contact email
                    </span>
                  )}
                </span>
              </p>

              {settings.contactPhone && (
                <p className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-lime/80" strokeWidth={1.5} />
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="transition hover:text-white"
                  >
                    {settings.contactPhone}
                  </a>
                </p>
              )}

              {settings.hasLocation && settings.mapLink && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={settings.mapLink}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/75 transition hover:border-lime/60 hover:text-lime"
                  >
                    <Navigation className="size-3.5" />
                    Get directions
                    <ArrowUpRight className="size-3.5" />
                  </a>
                  {settings.googleBusinessUrl && (
                    <a
                      href={settings.googleBusinessUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/75 transition hover:border-lime/60 hover:text-lime"
                    >
                      <MapPin className="size-3.5" />
                      Google listing
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-start gap-2 border-t border-white/10 pt-4 text-[0.68rem] leading-relaxed text-white/35">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-lime/60" />
                <p>
                  Order on WhatsApp · Flat {formatPrice(shipping.rate)} delivery,
                  complimentary above {formatPrice(shipping.threshold)}. Final
                  delivery and payment are confirmed in chat.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-5">
          <div className="flex flex-col justify-between gap-3 text-[0.66rem] leading-relaxed text-white/35 sm:flex-row sm:items-center">
            <p>
              © {year} {settings.businessName}. All rights reserved.
            </p>
            <p className="max-w-xl sm:text-right">
              Demonstration storefront. Catalogue, pricing and stock are demo
              data; editorial photography is licensed stand-in imagery.{" "}
              <Link href="/credits" className="text-white/55 underline underline-offset-2 hover:text-white">
                Credits
              </Link>
              .
            </p>
          </div>
          <p className="sr-only">{SITE_DESCRIPTION}</p>
        </div>
        <p className="mt-3 text-center text-[0.62rem] tracking-[0.02em] text-white/30">
          Made &amp; managed by{" "}
          <a
            href="https://hsbjk.in"
            target="_blank"
            rel="noreferrer noopener"
            className="text-white/55 underline underline-offset-2 transition hover:text-lime"
          >
            HSBJK
          </a>
        </p>
      </div>
    </footer>
  );
}
