"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Info, X } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";

export function Toaster() {
  const { toasts, dismissToast, cartOpen } = useStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`pointer-events-none fixed inset-x-4 z-[160] flex flex-col items-center gap-2 transition-[bottom] duration-300 sm:left-auto sm:right-6 sm:items-end ${
        cartOpen ? "bottom-[220px]" : "bottom-5"
      }`}
    >
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 border border-white/10 bg-deep px-4 py-3.5 text-white shadow-[0_24px_60px_-28px_rgba(5,44,25,0.65)]"
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-lime/15 text-lime">
              {item.tone === "error" ? (
                <AlertCircle className="size-3.5" strokeWidth={2} />
              ) : item.tone === "info" ? (
                <Info className="size-3.5" strokeWidth={2} />
              ) : (
                <Check className="size-3.5" strokeWidth={2.4} />
              )}
            </span>
            <p className="flex-1 text-[0.78rem] leading-relaxed text-white/90">
              {item.message}
            </p>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              className="mt-0.5 text-white/45 transition hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
