import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, ShieldCheck } from "lucide-react";
import { POLICY_LINKS } from "@/lib/constants";
import type { StoreSettings } from "@/lib/settings";

export type PolicySection = {
  heading: string;
  body: ReactNode;
};

export function PolicyPage({
  title,
  eyebrow,
  intro,
  sections,
  currentHref,
  settings,
  notice,
}: {
  title: string;
  eyebrow: string;
  intro: string;
  sections: PolicySection[];
  currentHref: string;
  settings: StoreSettings;
  notice?: ReactNode;
}) {
  const demoEmail = settings.contactEmail.endsWith(".example");

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow text-forest/45">{eyebrow}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <h1 className="font-display text-[clamp(2.8rem,6vw,5rem)] leading-[0.94] tracking-[-0.04em]">
              {title}
            </h1>
            <p className="max-w-lg text-[0.88rem] leading-relaxed text-muted">
              {intro}
            </p>
          </div>
          <p className="mt-6 text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-forest/35">
            Last updated 18 November 2026 · Demonstration storefront
          </p>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container-page grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-forest/45">Policies</p>
            <nav aria-label="Policy navigation" className="mt-3 border-t border-line">
              {POLICY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={link.href === currentHref ? "page" : undefined}
                  className={`flex items-center justify-between border-b border-line py-2.5 text-[0.76rem] transition ${
                    link.href === currentHref
                      ? "font-semibold text-forest"
                      : "text-muted hover:text-forest"
                  }`}
                >
                  {link.label}
                  <ArrowRight className="size-3 text-forest/25" />
                </Link>
              ))}
            </nav>

            <div className="mt-5 border border-line bg-white p-4">
              <Mail className="size-4 text-forest/35" strokeWidth={1.5} />
              <p className="mt-2 text-[0.72rem] font-semibold">Questions?</p>
              <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">
                Write to{" "}
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="break-all underline underline-offset-2"
                >
                  {settings.contactEmail}
                </a>
                {demoEmail && (
                  <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.08em] text-muted/50">
                    Demo address
                  </span>
                )}
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest transition hover:text-bright"
              >
                Contact page <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </aside>

          <div className="min-w-0">
            {notice && (
              <div className="mb-6 flex items-start gap-2.5 border border-[#e4d9b7] bg-[#faf6e9] p-4 text-[0.76rem] leading-relaxed text-[#6a5827]">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <div>{notice}</div>
              </div>
            )}
            <div className="prose-editorial max-w-[68ch]">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.body}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
