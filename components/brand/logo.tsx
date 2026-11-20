import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/omnexa-logo.webp"
      alt="OMNEXA emblem"
      width={128}
      height={128}
      priority
      className={className}
    />
  );
}

export function BrandLogo({
  tone = "dark",
  href = "/",
  className,
}: {
  tone?: "dark" | "light";
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx("brand-lockup group", className)}
      aria-label="OMNEXA — home"
    >
      <BrandMark className="brand-mark" />
      <span className="brand-wordmark">
        <span className={clsx("brand-name", tone === "light" && "text-white")}>OMNEXA</span>
        <span
          className={clsx(
            "brand-descriptor",
            tone === "light" ? "text-white/55" : "text-forest/55",
          )}
        >
          Beauty &amp; Jewellery
        </span>
      </span>
    </Link>
  );
}
