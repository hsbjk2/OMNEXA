import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  tone = "dark",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  href?: string;
  linkLabel?: string;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal className={cn("w-full", className)}>
      <div
        className={cn(
          "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
          align === "center" && "sm:flex-col sm:items-center sm:text-center",
        )}
      >
        <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
          {eyebrow && (
            <p
              className={cn(
                "eyebrow mb-4",
                tone === "light" ? "text-lime" : "text-forest/55",
              )}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className={cn(
              "title-lg",
              tone === "light" ? "text-white" : "text-ink",
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "mt-4 max-w-lg text-[0.9rem] leading-relaxed",
                tone === "light" ? "text-white/50" : "text-muted",
              )}
            >
              {description}
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className={cn(
              "btn-quiet shrink-0 pb-1",
              tone === "light" && "text-white hover:text-lime",
            )}
          >
            {linkLabel} <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
    </Reveal>
  );
}
