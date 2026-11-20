"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type Panel = {
  src: string;
  alt: string;
  label: string;
  note: string;
  href: string;
};

const panels: Panel[] = [
  {
    src: "/images/categories/skincare.webp",
    alt: "Skincare bottles arranged for a daily ritual — licensed stand-in photography",
    label: "Skincare",
    note: "The daily layer",
    href: "/category/skincare",
  },
  {
    src: "/images/categories/makeup-cosmetics.webp",
    alt: "Makeup colour and brushes arranged on a neutral surface — licensed stand-in photography",
    label: "Colour",
    note: "The finishing touch",
    href: "/category/makeup-cosmetics",
  },
  {
    src: "/images/categories/artificial-jewellery.webp",
    alt: "Gold-toned artificial jewellery styled on soft fabric — licensed stand-in photography",
    label: "Jewellery",
    note: "The last detail",
    href: "/category/artificial-jewellery",
  },
];

function PanelCard({ panel }: { panel: Panel }) {
  return (
    <Link
      href={panel.href}
      className="group relative block h-full overflow-hidden border border-white/12 bg-white/[0.04] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.85)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={panel.src}
          alt={panel.alt}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 32vw, 30vw"
          className="object-cover transition duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/15 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 lg:p-5">
        <p className="text-[0.48rem] font-semibold uppercase tracking-[0.17em] text-lime/75 sm:text-[0.52rem]">
          {panel.note}
        </p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="font-display text-[1.25rem] leading-none text-white sm:text-[1.5rem] lg:text-[1.7rem]">
            {panel.label}
          </p>
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition duration-300 group-hover:border-lime group-hover:bg-lime group-hover:text-deep">
            <ArrowUpRight className="size-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ScrollScene() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.4,
  });

  const leftRotateY = useTransform(progress, [0, 0.34, 0.78, 1], [32, 0, -5, -9]);
  const leftX = useTransform(progress, [0, 0.34, 0.78, 1], [-14, 0, -10, -22]);
  const leftY = useTransform(progress, [0, 0.34, 0.78, 1], [30, 0, -10, -26]);
  const leftZ = useTransform(progress, [0, 0.34, 0.78, 1], [-120, 55, 25, -10]);
  const leftOpacity = useTransform(progress, [0, 0.12, 0.9, 1], [0.55, 1, 1, 0.8]);

  const centreRotateX = useTransform(progress, [0, 0.34, 1], [9, 0, 3]);
  const centreZ = useTransform(progress, [0, 0.34, 1], [-50, 90, 40]);
  const centreScale = useTransform(progress, [0, 0.34, 1], [0.93, 1, 0.975]);
  const centreOpacity = useTransform(progress, [0, 0.1, 1], [0.7, 1, 1]);

  const rightRotateY = useTransform(progress, [0, 0.34, 0.78, 1], [-32, 0, 5, 9]);
  const rightX = useTransform(progress, [0, 0.34, 0.78, 1], [14, 0, 10, 22]);
  const rightY = useTransform(progress, [0, 0.34, 0.78, 1], [32, 0, -8, -24]);
  const rightZ = useTransform(progress, [0, 0.34, 0.78, 1], [-120, 55, 25, -10]);
  const rightOpacity = useTransform(progress, [0, 0.12, 0.9, 1], [0.55, 1, 1, 0.8]);

  return (
    <section className="relative overflow-x-clip bg-deep text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(168,217,22,0.12),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/25 to-transparent" />

      <div className="container-page relative z-10 pt-16 sm:pt-20 lg:pt-24">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow text-lime">The cabinet, in three dimensions</p>
            <h2 className="title-lg mt-4">
              Three shelves.
              <br />
              <span className="italic text-white/45">One ritual.</span>
            </h2>
          </div>
          <div className="max-w-lg lg:justify-self-end">
            <p className="text-[0.9rem] leading-relaxed text-white/50">
              Skincare, colour and the finishing jewellery — the same
              considered edit, seen from a different angle. Scroll to move
              through the cabinet.
            </p>
            <p className="mt-4 text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-white/25">
              Demo photography · licensed stand-in imagery
            </p>
          </div>
        </div>
      </div>

      {reduce ? (
        <div className="container-page relative z-10 pb-16 pt-10 sm:pb-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {panels.map((panel) => (
              <div key={panel.href} className="relative">
                <PanelCard panel={panel} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={stageRef}
          className="relative z-10 mt-2 h-[125vh] sm:h-[145vh] lg:h-[165vh]"
        >
          <div className="sticky top-[7.5rem] flex h-[calc(100svh-7.5rem)] items-center justify-center px-4 pb-6 sm:px-8">
            <div className="relative h-[min(64vh,540px)] w-full max-w-5xl [transform-style:preserve-3d] [perspective:1400px]">
              <div className="pointer-events-none absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/[0.08]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 size-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]" />

              <motion.div
                style={{
                  rotateY: leftRotateY,
                  x: leftX,
                  y: leftY,
                  z: leftZ,
                  opacity: leftOpacity,
                  transformOrigin: "center center",
                }}
                className="absolute left-0 top-[30%] z-10 w-[40%] will-change-transform sm:top-[26%] sm:w-[30%] lg:left-[2%] lg:top-[25%] lg:w-[29%]"
              >
                <PanelCard panel={panels[0]} />
              </motion.div>

              <motion.div
                style={{
                  rotateX: centreRotateX,
                  z: centreZ,
                  scale: centreScale,
                  opacity: centreOpacity,
                  transformOrigin: "center center",
                }}
                className="absolute left-[27%] top-[9%] z-30 w-[46%] will-change-transform sm:left-[34%] sm:top-[7%] sm:w-[32%] lg:left-[35%] lg:top-[4%] lg:w-[30%]"
              >
                <PanelCard panel={panels[1]} />
              </motion.div>

              <motion.div
                style={{
                  rotateY: rightRotateY,
                  x: rightX,
                  y: rightY,
                  z: rightZ,
                  opacity: rightOpacity,
                  transformOrigin: "center center",
                }}
                className="absolute left-[60%] top-[29%] z-20 w-[40%] will-change-transform sm:left-[70%] sm:top-[25%] sm:w-[30%] lg:left-[69%] lg:top-[24%] lg:w-[29%]"
              >
                <PanelCard panel={panels[2]} />
              </motion.div>
            </div>
          </div>
        </div>
      )}

      <div className="container-page relative z-10 flex flex-col justify-between gap-3 border-t border-white/10 py-6 text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-white/25 sm:flex-row sm:items-center">
        <span>Skincare · Makeup · Jewellery</span>
        <span className="inline-flex items-center gap-2">
          <span className="h-px w-8 bg-lime/40" />
          Scroll to explore
        </span>
      </div>
    </section>
  );
}
