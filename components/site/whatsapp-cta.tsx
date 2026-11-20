import { WhatsAppIcon } from "@/components/site/social-icons";

export function WhatsAppCta({ whatsapp }: { whatsapp: string }) {
  const digits = whatsapp.replace(/[^0-9]/g, "");
  if (!digits) return null;

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(
    "Hi OMNEXA! I would like to place an order and get further details.",
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Order from OMNEXA on WhatsApp"
      title="Order on WhatsApp"
      className="group fixed bottom-4 right-4 z-[85] flex size-12 items-center justify-center rounded-full bg-[#128c47] text-white shadow-[0_16px_38px_-14px_rgba(5,44,25,0.6)] transition duration-300 hover:scale-105 hover:bg-[#0e743a] focus-visible:outline-offset-4 sm:bottom-5 sm:right-5 sm:size-14"
    >
      <WhatsAppIcon className="size-6 shrink-0" />
    </a>
  );
}
