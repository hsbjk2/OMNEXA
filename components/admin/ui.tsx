import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-forest/45">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 font-display text-[2rem] leading-tight tracking-[-0.02em] text-ink sm:text-[2.4rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[0.8rem] leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: "default" | "lime" | "warn";
}) {
  return (
    <div
      className={cn(
        "border p-4 sm:p-5",
        tone === "lime"
          ? "border-lime/40 bg-lime/20"
          : tone === "warn"
            ? "border-[#e4d9b7] bg-[#faf6e9]"
            : "border-line bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.56rem] font-bold uppercase tracking-[0.14em] text-muted/65">
          {label}
        </p>
        {Icon && <Icon className="size-4 text-forest/30" strokeWidth={1.5} />}
      </div>
      <p className="mt-3 font-display text-[1.9rem] leading-none tracking-tight text-ink sm:text-[2.2rem]">
        {value}
      </p>
      {hint && <p className="mt-2 text-[0.68rem] leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}

export function AdminSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-line bg-white", className)}>
      <div className="flex flex-col gap-2 border-b border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-[0.85rem] font-semibold text-ink">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[0.68rem] text-muted">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminEmpty({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-5 py-14 text-center">
      <Icon className="mx-auto size-6 text-forest/20" strokeWidth={1.3} />
      <p className="mt-3 font-display text-[1.3rem] text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-[0.76rem] leading-relaxed text-muted">
        {body}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
