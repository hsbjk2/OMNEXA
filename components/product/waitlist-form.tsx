"use client";

import { useActionState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { joinWaitlistAction } from "@/app/actions/public";
import { initialActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

export function WaitlistForm({
  productId,
  tone = "dark",
  compact = false,
}: {
  productId: string;
  tone?: "dark" | "light";
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    joinWaitlistAction,
    initialActionState,
  );

  if (state.status === "success") {
    return (
      <div
        className={cn(
          "flex items-start gap-2.5 text-xs leading-relaxed",
          tone === "dark" ? "text-white/65" : "text-muted",
        )}
        role="status"
      >
        <span
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
            tone === "dark"
              ? "bg-lime/15 text-lime"
              : "bg-forest text-lime",
          )}
        >
          <Check className="size-3" strokeWidth={2.5} />
        </span>
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="productId" value={productId} />
      <label htmlFor={`waitlist-${productId}`} className="sr-only">
        Email address for arrival notification
      </label>
      <div className={cn("flex", compact ? "flex-col gap-2" : "gap-0")}>
        <input
          id={`waitlist-${productId}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Email address"
          aria-invalid={Boolean(state.errors?.email)}
          className={cn(
            "field h-11 min-w-0 flex-1 rounded-none border",
            compact ? "" : "border-r-0",
            tone === "dark"
              ? "border-white/15 bg-white/[0.06] text-white placeholder:text-white/30 focus:border-lime/60 focus:bg-white/10 focus:ring-lime/15"
              : "bg-white",
            state.errors?.email && "border-wine/60",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "btn h-11 shrink-0 rounded-none px-4",
            tone === "dark" ? "btn-lime" : "btn-forest",
            compact && "w-full",
          )}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Notify me <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </div>
      {(state.errors?.email || (state.status === "error" && state.message)) && (
        <p
          className={cn(
            "mt-2 text-[0.68rem] leading-relaxed",
            tone === "dark" ? "text-lime" : "text-wine",
          )}
          role="alert"
        >
          {state.errors?.email || state.message}
        </p>
      )}
    </form>
  );
}
