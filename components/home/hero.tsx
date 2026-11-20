"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const stillY = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 110]);

  return (
    <section
      ref={ref}
      className="grain relative overflow-hidden bg-deep text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={reduce ? undefined : { y: glowY }}
          className="absolute -right-[18%] top-[-10%] size-[780px] rounded-full bg-[radial-gradient(circle,rgba(168,217,22,0.16)_0%,rgba(168,217,22,0.04)_38%,transparent_70%)] blur-[2px]"
        />
        <div className="absolute -bottom-40 -left-24 size-[420px] rounded-full border border-white/[0.045]" />
        <div className="absolute -bottom-16 left-20 size-[210px] rounded-full border border-lime/[0.09]" />
      </div>

      <div className="container-page relative z-10 grid items-center gap-12 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:min-h-[calc(100svh-116px)] lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:pb-24 lg:pt-16 xl:gap-16">
        <div className="max-w-[700px]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05, ease }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-9 bg-lime/70" />
            <p className="eyebrow text-lime">
              Skincare · Makeup · Jewellery
            </p>
          </motion.div>

          <h1 className="mt-6 text-[clamp(2.65rem,7vw,6rem)] font-normal leading-[0.91] tracking-[-0.045em] text-white">
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "112%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.12, ease }}
              >
                Beauty, elegance
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "112%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.22, ease }}
              >
                <span className="text-white/35">&amp;</span> everything
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block italic text-lime"
                initial={reduce ? false : { y: "112%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.32, ease }}
              >
                you love.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.5, ease }}
            className="mt-7 max-w-[440px] text-[0.94rem] leading-[1.8] text-white/58"
          >
            Considered skincare, colour, kits and jewellery — chosen for the
            way you actually get ready. Find your ritual, one beautiful thing
            at a time.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.62, ease }}
            className="mt-8 flex flex-col gap-2.5 sm:flex-row"
          >
            <Link href="/shop" className="btn btn-lime">
              Shop the collection <ArrowRight className="size-3.5" />
            </Link>
            <Link href="/new-arrivals" className="btn btn-outline-light">
              Discover new arrivals
            </Link>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-[0.56rem] font-semibold uppercase tracking-[0.17em] text-white/32"
          >
            <span>Retail &amp; wholesale</span>
            <span className="size-1 rounded-full bg-lime/50" />
            <span>Cash on delivery</span>
            <span className="size-1 rounded-full bg-lime/50" />
            <span>Considered edits</span>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-[510px] lg:mr-0 lg:max-w-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 1.035 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.3, delay: 0.18, ease }}
            className="relative ml-auto w-[86%] sm:w-[78%] lg:w-[88%]"
          >
            <motion.div
              style={reduce ? undefined : { y: imageY }}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[7rem] border border-white/10 bg-[#0c3323] sm:rounded-t-[10rem]"
            >
              <Image
                src="/images/editorial/hero-portrait.webp"
                alt="Editorial portrait with gold-toned jewellery, a licensed stand-in image"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 42vw"
                className="object-cover object-[center_32%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/35 via-transparent to-deep/10" />
            </motion.div>

            <motion.div
              style={reduce ? undefined : { y: stillY }}
              className="absolute -bottom-10 -left-6 w-[46%] border-[5px] border-deep shadow-2xl sm:-left-10 sm:w-[43%] lg:-left-12"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-light">
                <Image
                  src="/images/editorial/hero-still.webp"
                  alt="A white cosmetic jar resting on white silk"
                  fill
                  priority
                  sizes="(max-width: 640px) 40vw, 18vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-deep/75 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-[0.5rem] font-semibold uppercase leading-relaxed tracking-[0.17em] text-white/65">
                  The everyday edit
                  <span className="mt-0.5 block font-normal text-white/35">
                    Skincare, colour, jewellery
                  </span>
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="absolute -left-1 bottom-20 z-20 sm:bottom-24 lg:-left-4 lg:bottom-28"
          >
            <Link
              href="/new-arrivals"
              aria-label="Explore new arrivals"
              className="group flex size-[86px] flex-col items-center justify-center rounded-full bg-lime text-center text-deep transition duration-300 hover:bg-white sm:size-[104px]"
            >
              <span className="text-[0.48rem] font-bold uppercase tracking-[0.14em]">
                The new
              </span>
              <span className="my-1 font-display text-lg italic leading-none sm:text-xl">
                edit
              </span>
              <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute -right-2 top-10 hidden flex-col items-center gap-2 xl:flex"
          >
            <span className="text-[0.5rem] font-semibold uppercase tracking-[0.28em] text-white/30 [writing-mode:vertical-rl]">
              OMNEXA — EST. IN RITUAL
            </span>
            <ArrowDownRight className="size-4 text-lime/60" />
          </motion.div>
        </div>
      </div>

      <div className="border-t border-white/[0.08]">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.19em] text-white/28">
            Skincare · Makeup · Makeup kits · Artificial jewellery · Accessories
          </p>
          <p className="text-[0.55rem] uppercase tracking-[0.16em] text-white/20">
            Retail and wholesale availability
          </p>
        </div>
      </div>
    </section>
  );
}
