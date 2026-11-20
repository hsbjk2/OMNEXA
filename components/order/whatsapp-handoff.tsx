"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/social-icons";

export function WhatsAppHandoff({
  href,
  orderNumber,
  auto,
}: {
  href: string | null;
  orderNumber: string;
  auto: boolean;
}) {
  const [autoOpen, setAutoOpen] = useState(auto && Boolean(href));

  useEffect(() => {
    if (!auto || !href || !autoOpen) return;
    const timer = window.setTimeout(() => {
      window.location.href = href;
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [autoOpen, auto, href]);

  if (!href) {
    return (
      <div className="w-full border border-line bg-white p-5 text-left">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-4 text-forest/50" strokeWidth={1.5} />
          <p className="eyebrow text-forest/50">Send your order</p>
        </div>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-muted">
          WhatsApp ordering is not configured right now. Please use the contact
          page and quote order {orderNumber} so the store can help you complete
          it.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full border border-[#128c47]/25 bg-[#f1f8f3] p-5 text-left sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#128c47] text-white">
          <WhatsAppIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="eyebrow text-[#0e743a]">
            {autoOpen ? "Opening WhatsApp" : "One last step"}
          </p>
          <h2 className="mt-1.5 font-display text-[1.65rem] leading-tight text-ink">
            Send order {orderNumber} to the seller.
          </h2>
          <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted">
            Your WhatsApp message already includes the items, total and delivery
            address. The seller reviews it and replies with the payment options.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="btn justify-center bg-[#128c47] text-white hover:bg-[#0e743a]"
        >
          <WhatsAppIcon className="size-4" /> Open WhatsApp
        </a>
        {autoOpen && (
          <button
            type="button"
            onClick={() => setAutoOpen(false)}
            className="text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-forest/55 transition hover:text-forest sm:px-2"
          >
            Stay on this page
          </button>
        )}
      </div>

      {autoOpen ? (
        <p
          className="mt-3 flex items-center gap-2 text-[0.66rem] text-[#0e743a]"
          aria-live="polite"
        >
          <Loader2 className="size-3.5 animate-spin" /> Taking you to WhatsApp
          automatically…
        </p>
      ) : (
        <p className="mt-3 text-[0.66rem] leading-relaxed text-muted">
          If WhatsApp did not open, tap the button above. You can return to this
          page at any time to resend the message.
        </p>
      )}

      <div className="mt-4 flex items-start gap-2 border-t border-[#128c47]/15 pt-3 text-[0.64rem] leading-relaxed text-forest/55">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Payment is arranged directly with the seller. This website does not
          collect card, UPI or bank details.
        </p>
      </div>
    </div>
  );
}
