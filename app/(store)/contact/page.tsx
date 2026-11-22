import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Store,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { ContactForm } from "@/components/site/contact-form";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/components/site/social-icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact OMNEXA about products, retail availability or wholesale enquiries.",
  openGraph: {
    title: "Contact OMNEXA",
    description:
      "Questions about a product or a wholesale enquiry — write to the OMNEXA team.",
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [user, settings] = await Promise.all([
    getCurrentUser(),
    getSiteSettings(),
  ]);

  const subject =
    typeof params.subject === "string" ? params.subject.slice(0, 120) : "";
  const demoEmail = settings.contactEmail.endsWith(".example");
  const whatsappHref = buildWhatsAppHref(
    settings.whatsapp,
    "Hi OMNEXA! I would like to enquire about your products and get further details.",
  );

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-page py-12 sm:py-16 lg:py-20">
          <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="eyebrow text-forest/45">Contact</p>
              <h1 className="title-xl mt-4">
                Write
                <br />
                <span className="italic text-forest/60">to us.</span>
              </h1>
            </div>
            <div className="max-w-md lg:justify-self-end">
              <p className="text-[0.92rem] leading-relaxed text-muted">
                Product questions, retail availability or a wholesale enquiry —
                the same inbox reaches our team. For a specific purchase, send
                us the product or your bag as a WhatsApp enquiry.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/wholesale" className="btn btn-outline">
                  Wholesale enquiries <ArrowUpRight className="size-3.5" />
                </Link>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-quiet"
                  >
                    Message on WhatsApp <ArrowRight className="size-3.5" />
                  </a>
                )}
                {settings.whatsappCatalogueUrl && (
                  <a
                    href={settings.whatsappCatalogueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-quiet"
                  >
                    View catalogue on WhatsApp <ArrowUpRight className="size-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container-page grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <div className="mb-5">
              <p className="eyebrow text-forest/45">Send a message</p>
              <h2 className="mt-2 font-display text-[2rem] leading-tight sm:text-[2.5rem]">
                How can we help?
              </h2>
            </div>
            <ContactForm
              defaultSubject={subject}
              defaultName={user?.name ?? ""}
              defaultEmail={user?.email ?? ""}
            />
          </div>

          <aside className="space-y-4">
            <div className="border border-line bg-white p-5">
              <p className="eyebrow text-forest/45">Direct</p>
              <div className="mt-4 space-y-4 text-[0.82rem]">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-forest/40" strokeWidth={1.5} />
                  <div>
                    <p className="text-[0.72rem] font-semibold text-ink">Email</p>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="break-all text-muted underline underline-offset-2 transition hover:text-forest"
                    >
                      {settings.contactEmail}
                    </a>
                    {demoEmail && (
                      <p className="mt-1 text-[0.6rem] uppercase tracking-[0.1em] text-muted/50">
                        Demonstration address — replace in admin settings
                      </p>
                    )}
                  </div>
                </div>
                {settings.contactPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-forest/40" strokeWidth={1.5} />
                    <div>
                      <p className="text-[0.72rem] font-semibold text-ink">Phone</p>
                      <a
                        href={`tel:${settings.contactPhone}`}
                        className="text-muted transition hover:text-forest"
                      >
                        {settings.contactPhone}
                      </a>
                    </div>
                  </div>
                )}
                {whatsappHref && (
                  <div className="flex items-start gap-3">
                    <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-forest/40" />
                    <div>
                      <p className="text-[0.72rem] font-semibold text-ink">WhatsApp</p>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-muted transition hover:text-forest"
                      >
                        {settings.whatsapp}
                      </a>
                      <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.1em] text-muted/55">
                        Enquiries &amp; further details
                      </p>
                    </div>
                  </div>
                )}

                {settings.whatsappCatalogueUrl && (
                  <div className="flex items-start gap-3">
                    <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-forest/40" />
                    <div>
                      <p className="text-[0.72rem] font-semibold text-ink">
                        WhatsApp catalogue
                      </p>
                      <a
                        href={settings.whatsappCatalogueUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-muted transition hover:text-forest"
                      >
                        View the full catalogue
                      </a>
                    </div>
                  </div>
                )}

                {(settings.instagramUrl ||
                  settings.facebookUrl ||
                  settings.whatsappChannelUrl) && (
                  <div className="border-t border-line pt-4">
                    <p className="text-[0.72rem] font-semibold text-ink">Follow</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {settings.instagramUrl && (
                        <a
                          href={settings.instagramUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label="OMNEXA on Instagram"
                          className="flex size-9 items-center justify-center rounded-full border border-line text-forest/60 transition hover:border-forest hover:text-forest"
                        >
                          <InstagramIcon />
                        </a>
                      )}
                      {settings.facebookUrl && (
                        <a
                          href={settings.facebookUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label="OMNEXA on Facebook"
                          className="flex size-9 items-center justify-center rounded-full border border-line text-forest/60 transition hover:border-forest hover:text-forest"
                        >
                          <FacebookIcon />
                        </a>
                      )}
                      {settings.whatsappChannelUrl && (
                        <a
                          href={settings.whatsappChannelUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label="OMNEXA WhatsApp channel"
                          className="flex size-9 items-center justify-center rounded-full border border-line text-forest/60 transition hover:border-forest hover:text-forest"
                        >
                          <MessageCircle className="size-4" strokeWidth={1.5} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-line bg-white p-5">
              <div className="flex items-center gap-2">
                <Store className="size-4 text-forest/40" strokeWidth={1.5} />
                <p className="eyebrow text-forest/45">Visit</p>
              </div>
              {settings.hasLocation ? (
                <>
                  <p className="mt-3 flex items-start gap-2.5 text-[0.82rem] leading-relaxed text-muted">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-forest/35" />
                    {settings.fullAddress}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                    {settings.mapLink && (
                      <a
                        href={settings.mapLink}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-forest transition hover:text-bright"
                      >
                        <Navigation className="size-3.5" />
                        Get directions
                      </a>
                    )}
                    {settings.googleBusinessUrl && (
                      <a
                        href={settings.googleBusinessUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-forest transition hover:text-bright"
                      >
                        Google listing <ArrowUpRight className="size-3.5" />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-3 border border-dashed border-line bg-soft/60 p-4">
                  <p className="text-[0.8rem] leading-relaxed text-muted">
                    The physical store location is being finalised. No address
                    has been published yet — WhatsApp ordering is open, and the
                    real address will appear here once confirmed.
                  </p>
                </div>
              )}
            </div>

            {settings.mapEmbedUrl ? (
              <div className="overflow-hidden border border-line bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                  <span className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-forest/60">
                    <MapPin className="size-3.5" /> OMNEXA ENTERPRISE
                  </span>
                  <span className="text-[0.58rem] uppercase tracking-[0.1em] text-muted/55">
                    Live Google map
                  </span>
                </div>
                <iframe
                  src={settings.mapEmbedUrl}
                  title={`Map to ${settings.businessName}, ${settings.fullAddress}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[4/3] w-full"
                />
              </div>
            ) : (
              <div className="border border-line bg-light/50 p-5">
                <p className="eyebrow text-forest/40">Store map</p>
                <p className="mt-2 text-[0.78rem] leading-relaxed text-forest/60">
                  A Google Maps embed appears here once the store address and
                  map URL are saved in admin settings. We do not publish invented
                  coordinates.
                </p>
              </div>
            )}

            <div className="border border-line bg-white p-5">
              <p className="eyebrow text-forest/45">Need an answer now?</p>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-muted">
                The shipping and return policies explain how this demo store
                handles delivery, payment and after-sales questions.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                <Link
                  href="/policies/shipping"
                  className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-forest/55 underline underline-offset-4 transition hover:text-forest"
                >
                  Shipping
                </Link>
                <Link
                  href="/policies/returns"
                  className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-forest/55 underline underline-offset-4 transition hover:text-forest"
                >
                  Returns
                </Link>
                <Link
                  href="/policies/privacy"
                  className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-forest/55 underline underline-offset-4 transition hover:text-forest"
                >
                  Privacy
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
