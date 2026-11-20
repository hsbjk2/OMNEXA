import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Check,
  Handshake,
  MessagesSquare,
  Package,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Wholesale",
  description:
    "Retail and wholesale enquiries for OMNEXA beauty, skincare, makeup kits and artificial jewellery.",
  openGraph: {
    title: "Wholesale · OMNEXA",
    description:
      "Share your business, categories and quantities. Our team will confirm availability and terms directly.",
  },
};

export default async function WholesalePage() {
  const [user, settings] = await Promise.all([
    getCurrentUser(),
    getSiteSettings(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-deep text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/editorial/wholesale-work.webp"
            alt="Beauty products arranged for a business stocktake"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/85 to-deep/45" />
        </div>
        <div className="container-page relative z-10 py-16 sm:py-24 lg:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow text-lime">Retail &amp; wholesale</p>
            <h1 className="mt-4 font-display text-[clamp(3rem,6.5vw,5.8rem)] leading-[0.92] tracking-[-0.04em]">
              Good stock,
              <br />
              <span className="italic text-lime">chosen well.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[0.92rem] leading-relaxed text-white/55">
              OMNEXA works with retailers and stockists who value a considered
              edit. Tell us about your business and the categories you need — we
              will confirm availability, quantities and terms directly.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#enquiry" className="btn btn-lime">
                Start an enquiry <ArrowRight className="size-3.5" />
              </a>
              <Link href="/shop" className="btn btn-outline-light">
                Browse the range
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.6rem] uppercase tracking-[0.14em] text-white/35">
              <span className="inline-flex items-center gap-2">
                <Check className="size-3.5 text-lime" /> Skincare &amp; colour
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-3.5 text-lime" /> Makeup kits
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-3.5 text-lime" /> Artificial jewellery
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container-page grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="eyebrow text-forest/45">How it works</p>
            <h2 className="title-lg mt-4">
              A direct conversation,
              <br />
              <span className="italic text-forest/65">not a form letter.</span>
            </h2>
            <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-muted">
              Wholesale terms depend on the range, quantities and destination.
              We would rather confirm them with you than publish numbers that
              are not final.
            </p>

            <div className="mt-8 space-y-0 border-t border-line">
              {[
                {
                  icon: MessagesSquare,
                  number: "01",
                  title: "Tell us about your business",
                  body: "Your store or channel, location, the categories that fit your customer and the quantities you have in mind.",
                },
                {
                  icon: Boxes,
                  number: "02",
                  title: "We review the range",
                  body: "Our team checks current availability across skincare, makeup, kits and jewellery, including upcoming launches.",
                },
                {
                  icon: Handshake,
                  number: "03",
                  title: "Agree quantities and terms",
                  body: "We confirm pricing, packing, payment and delivery directly before anything is committed.",
                },
              ].map((step) => (
                <div key={step.number} className="flex gap-4 border-b border-line py-5">
                  <div className="flex size-9 shrink-0 items-center justify-center border border-line bg-white text-forest/45">
                    <step.icon className="size-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-forest/35">
                      {step.number}
                    </p>
                    <h3 className="mt-1 font-display text-[1.35rem] leading-tight">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 border border-line bg-light/50 p-5">
              <div className="flex items-start gap-2.5">
                <Package className="mt-0.5 size-4 shrink-0 text-forest/40" />
                <p className="text-[0.78rem] leading-relaxed text-forest/65">
                  No minimum order, trade price or dispatch promise is published
                  on this page because those terms are confirmed per enquiry.
                  Nothing shown is a binding offer.
                </p>
              </div>
            </div>
          </div>

          <div id="enquiry" className="scroll-mt-28">
            <div className="mb-5">
              <p className="eyebrow text-forest/45">Wholesale enquiry</p>
              <h2 className="mt-2 font-display text-[2rem] leading-tight sm:text-[2.5rem]">
                Tell us what you need.
              </h2>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">
                Your message goes directly to the admin inbox marked as a
                wholesale enquiry. Direct email is <span className="break-all">{settings.contactEmail}</span>.
              </p>
            </div>
            <ContactForm
              type="WHOLESALE"
              defaultSubject="Wholesale enquiry"
              defaultName={user?.name ?? ""}
              defaultEmail={user?.email ?? ""}
            />

            <div className="mt-5 border border-line bg-white p-5">
              <p className="eyebrow text-forest/45">Helpful to include</p>
              <ul className="mt-3 space-y-2 text-[0.78rem] leading-relaxed text-muted">
                {[
                  "Business name, store type and location",
                  "Categories and products you are considering",
                  "Approximate quantities per piece or assortment",
                  "Preferred timeline and delivery city",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-bright" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
