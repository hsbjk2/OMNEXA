import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-soft">
      <div className="grid min-h-dvh lg:grid-cols-[1.02fr_0.98fr]">
        <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-9 lg:px-14 xl:px-20">
          <header className="flex items-center justify-between">
            <BrandLogo />
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-forest/50 transition hover:text-forest"
            >
              <ArrowLeft className="size-3.5" /> Back to shop
            </Link>
          </header>

          <main id="main" className="flex flex-1 items-center py-10 sm:py-14">
            <div className="mx-auto w-full max-w-[440px]">{children}</div>
          </main>

          <footer className="flex flex-col gap-2 border-t border-line pt-4 text-[0.6rem] leading-relaxed text-muted/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} OMNEXA. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/policies/privacy" className="transition hover:text-forest">
                Privacy
              </Link>
              <Link href="/policies/terms" className="transition hover:text-forest">
                Terms
              </Link>
              <Link href="/contact" className="transition hover:text-forest">
                Help
              </Link>
            </div>
          </footer>
        </div>

        <div className="relative hidden overflow-hidden bg-deep lg:block">
          <Image
            src="/images/editorial/hero-portrait.webp"
            alt="Editorial beauty portrait with gold-toned jewellery"
            fill
            priority
            sizes="50vw"
            className="object-cover object-[center_28%] opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/25 to-deep/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-14">
            <p className="eyebrow text-lime">OMNEXA</p>
            <p className="mt-4 max-w-md font-display text-[2.6rem] leading-[1.02] tracking-[-0.03em] xl:text-[3rem]">
              Beauty, elegance
              <br />
              &amp; everything{" "}
              <span className="italic text-lime">you love.</span>
            </p>
            <div className="mt-6 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.14em] text-white/40">
              <ShieldCheck className="size-3.5 text-lime/70" />
              Secure accounts · Private sessions · Your data, handled carefully
            </div>
          </div>
          <p className="absolute right-8 top-8 text-[0.55rem] uppercase tracking-[0.2em] text-white/25">
            Skincare · Colour · Jewellery
          </p>
        </div>
      </div>
    </div>
  );
}
