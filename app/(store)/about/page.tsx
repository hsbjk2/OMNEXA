import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Feather,
  Handshake,
  Leaf,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "The OMNEXA idea: a considered cabinet of skincare, makeup, kits and artificial jewellery for real, everyday rituals.",
  openGraph: {
    title: "The OMNEXA idea",
    description:
      "Fewer, better choices across skincare, colour, kits and artificial jewellery.",
  },
};

const values = [
  {
    icon: Leaf,
    title: "Edited, not endless",
    body: "A small, deliberate catalogue instead of infinite shelves. Every piece should have a reason to be here.",
  },
  {
    icon: Feather,
    title: "Everyday first",
    body: "Formulas, colours and jewellery chosen for repeat wear — not once-a-year occasions or unrealistic routines.",
  },
  {
    icon: Handshake,
    title: "Retail and wholesale",
    body: "The same considered edit, available to individual customers and to stockists building their own shelves.",
  },
  {
    icon: Sparkles,
    title: "Clarity over noise",
    body: "Real stock states, honest demo labels and no invented reviews, ratings or countdown pressure.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-soft">
        <div className="container-page grid items-stretch gap-0 lg:grid-cols-2">
          <div className="flex flex-col justify-center py-12 pr-0 sm:py-16 lg:pr-16 lg:py-24">
            <Reveal>
              <p className="eyebrow text-forest/45">The OMNEXA idea</p>
              <h1 className="mt-4 font-display text-[clamp(3rem,6vw,5.6rem)] leading-[0.9] tracking-[-0.045em]">
                A cabinet,
                <br />
                <span className="italic text-forest/60">considered.</span>
              </h1>
              <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-muted">
                OMNEXA brings skincare, makeup, makeup kits and artificial
                jewellery together under one quiet roof. Not to offer more, but
                to make the choosing easier.
              </p>
              <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted">
                The idea is simple: formulas that feel good to use, colours you
                reach for without thinking and jewellery made for repeat wear.
                Pieces that earn their place.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/shop" className="btn btn-forest">
                  Shop the edit <ArrowRight className="size-3.5" />
                </Link>
                <Link href="/wholesale" className="btn-quiet">
                  Wholesale <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="relative min-h-[420px] lg:min-h-[680px]">
            <Image
              src="/images/editorial/about-ritual.webp"
              alt="A quiet beauty ritual with a facial roller and soft textiles"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 left-5 max-w-[260px] bg-soft/95 p-5 backdrop-blur-sm sm:left-8 sm:bottom-8">
              <p className="font-display text-[1.35rem] leading-[1.15]">
                “Not more.
                <br />
                <span className="italic">Better chosen.”</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {values.map((value, index) => (
            <Reveal
              key={value.title}
              delay={index * 0.06}
              className="border-b border-line py-8 sm:border-b-0 sm:border-r sm:px-6 sm:last:border-r-0 lg:py-10 lg:first:pl-0"
            >
              <value.icon className="size-5 text-forest/55" strokeWidth={1.3} />
              <h2 className="mt-4 font-display text-[1.4rem] leading-tight">
                {value.title}
              </h2>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-muted">
                {value.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-light">
              <Image
                src="/images/editorial/editorial-still.webp"
                alt="Cosmetic packaging arranged on soft fabric"
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -right-2 -top-2 hidden size-32 border border-lime/40 sm:block" />
          </Reveal>
          <Reveal delay={0.08} className="order-1 lg:order-2">
            <p className="eyebrow text-forest/45">What we look for</p>
            <h2 className="title-lg mt-4">
              The shelf test.
              <br />
              <span className="italic text-forest/65">Would we reach for it?</span>
            </h2>
            <div className="prose-editorial mt-6 max-w-lg">
              <p>
                Before a piece joins OMNEXA, we ask a simple question: does it
                earn its space? That means a texture that feels right, a colour
                that works for an ordinary morning and a piece of jewellery that
                survives more than one outing.
              </p>
              <p>
                We are not interested in trends for their own sake. The
                catalogue can stay small. What matters is that each category —
                skin, colour, kits and jewellery — feels complete rather than
                crowded.
              </p>
              <p>
                For stockists, the same edit applies. We would rather help you
                choose a tight, coherent range than fill a shelf with pieces
                that sit.
              </p>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-line pt-6">
              <Link
                href="/category/skincare"
                className="group border border-line bg-white p-4 transition hover:border-forest/35"
              >
                <p className="eyebrow text-forest/35">01</p>
                <p className="mt-2 font-display text-[1.25rem] group-hover:text-forest">
                  Skincare
                </p>
                <p className="mt-1 text-[0.7rem] text-muted">Slow rituals, real textures.</p>
              </Link>
              <Link
                href="/category/artificial-jewellery"
                className="group border border-line bg-white p-4 transition hover:border-forest/35"
              >
                <p className="eyebrow text-forest/35">02</p>
                <p className="mt-2 font-display text-[1.25rem] group-hover:text-forest">
                  Jewellery
                </p>
                <p className="mt-1 text-[0.7rem] text-muted">Made for repeat wear.</p>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="grain relative overflow-hidden bg-deep py-16 text-white sm:py-20">
        <div className="container-page relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow text-lime">A working preview</p>
            <h2 className="title-lg mt-4 max-w-2xl">
              This storefront is real.
              <br />
              <span className="italic text-white/50">The catalogue is demo data.</span>
            </h2>
          </div>
          <div className="text-[0.82rem] leading-relaxed text-white/45">
            <p>
              Every screen you see is a functioning store — accounts, bag,
              wishlist, WhatsApp enquiries and admin. The seeded products,
              prices and stock are clearly labelled demonstration data, and the
              photography is licensed stand-in imagery.
            </p>
            <Link
              href="/credits"
              className="mt-3 inline-block text-[0.62rem] font-bold uppercase tracking-[0.13em] text-lime underline underline-offset-4"
            >
              Photography credits
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
