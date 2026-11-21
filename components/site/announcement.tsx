"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const DISMISS_KEY = "omnexa.announcement.dismissed.v1";

export function Announcement({ threshold }: { threshold: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") setVisible(false);
    } catch {
      // Storage is optional.
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-deep text-white">
      <div className="container-page flex min-h-9 items-center justify-center gap-2 py-2 pr-8 text-center">
        <Sparkles className="hidden size-3 shrink-0 text-lime sm:block" strokeWidth={1.8} />
        <p className="text-[0.6rem] font-medium uppercase leading-relaxed tracking-[0.15em] text-white/75 sm:text-[0.64rem]">
          Complimentary shipping on bags over{" "}
          <span className="text-lime">{formatPrice(threshold)}</span>
          <span className="mx-2 hidden text-white/25 sm:inline">/</span>
          <span className="hidden sm:inline">Order on WhatsApp</span>
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          setVisible(false);
          try {
            window.localStorage.setItem(DISMISS_KEY, "1");
          } catch {
            // Storage is optional.
          }
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/45 transition hover:text-white"
      >
        <X className="size-3.5" strokeWidth={1.6} />
      </button>
    </div>
  );
}
