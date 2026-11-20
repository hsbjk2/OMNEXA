"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  isDemo,
}: {
  images: string[];
  name: string;
  isDemo: boolean;
}) {
  const safeImages = images.length > 0 ? images : ["/images/fallback-product.webp"];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const closeRef = useRef<HTMLButtonElement>(null);
  const current = safeImages[active] ?? safeImages[0];

  useEffect(() => {
    if (!lightbox) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") setActive((index) => (index + 1) % safeImages.length);
      if (event.key === "ArrowLeft") {
        setActive((index) => (index - 1 + safeImages.length) % safeImages.length);
      }
    };
    window.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 100);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [lightbox, safeImages.length]);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[76px_minmax(0,1fr)] sm:items-start">
        {safeImages.length > 1 && (
          <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
            {safeImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${name}`}
                aria-current={index === active}
                className={cn(
                  "relative aspect-[4/5] w-16 shrink-0 overflow-hidden border bg-light transition sm:w-full",
                  index === active
                    ? "border-forest"
                    : "border-transparent opacity-65 hover:opacity-100",
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="76px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="order-1 sm:order-2">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-light text-left"
            aria-label={`View a larger image of ${name}`}
          >
            <Image
              src={current}
              alt={name}
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 55vw, 52vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.22]"
              style={{ transformOrigin: origin }}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;
                setOrigin(`${x}% ${y}%`);
              }}
            />
            <span className="absolute right-3 top-3 flex items-center gap-1.5 bg-white/88 px-2.5 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-forest backdrop-blur-sm">
              <Expand className="size-3" /> View
            </span>
            {isDemo && (
              <span className="absolute bottom-3 left-3 bg-deep/75 px-2.5 py-1.5 text-[0.53rem] font-semibold uppercase tracking-[0.13em] text-white/75 backdrop-blur-sm">
                Demo product image
              </span>
            )}
          </button>
          <div className="mt-3 flex items-center justify-between text-[0.6rem] uppercase tracking-[0.13em] text-forest/40">
            <span>{safeImages.length} image{safeImages.length === 1 ? "" : "s"}</span>
            <span className="hidden sm:inline">Hover to zoom · Click to expand</span>
            <span className="sm:hidden">Tap to expand</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[170] flex flex-col bg-deep/96 p-4 text-white backdrop-blur-sm sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`${name} image viewer`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40">
                {active + 1} / {safeImages.length}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setLightbox(false)}
                aria-label="Close image viewer"
                className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white hover:text-white"
              >
                <X className="size-5" strokeWidth={1.4} />
              </button>
            </div>
            <div className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center py-4">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative h-[70vh] w-full"
              >
                <Image
                  src={current}
                  alt={name}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </motion.div>
              {safeImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() =>
                      setActive(
                        (index) =>
                          (index - 1 + safeImages.length) % safeImages.length,
                      )
                    }
                    className="absolute left-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-deep/40 text-white/70 transition hover:text-white"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() =>
                      setActive((index) => (index + 1) % safeImages.length)
                    }
                    className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-deep/40 text-white/70 transition hover:text-white"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>
            <p className="pb-1 text-center text-[0.6rem] uppercase tracking-[0.16em] text-white/25">
              {name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
