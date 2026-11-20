"use client";

import { useActionState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { subscribeNewsletterAction } from "@/app/actions/public";
import { initialActionState } from "@/lib/action-state";

export function NewsletterForm({ tone = "lime" }: { tone?: "lime" | "light" }) {
  const [state, formAction, pending] = useActionState(
    subscribeNewsletterAction,
    initialActionState,
  );

  if (state.status === "success") {
    return (
      <div
        className={`flex items-start gap-3 border p-4 ${
          tone === "lime"
            ? "border-forest/20 bg-white/55 text-forest"
            : "border-line bg-white text-forest"
        }`}
        role="status"
      >
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-forest text-lime">
          <Check className="size-3.5" strokeWidth={2.4} />
        </span>
        <div>
          <p className="text-sm font-medium">You&apos;re on the list.</p>
          <p className="mt-1 text-xs leading-relaxed text-forest/65">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="Your email address"
            className={`field h-[50px] rounded-none ${
              tone === "lime"
                ? "border-forest/20 bg-white/80 focus:border-forest"
                : ""
            }`}
            aria-invalid={Boolean(state.errors?.email)}
            aria-describedby={
              state.errors?.email ? "newsletter-email-error" : undefined
            }
          />
          {state.errors?.email && (
            <p id="newsletter-email-error" className="field-error">
              {state.errors.email}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className={`btn h-[50px] shrink-0 rounded-none px-6 ${
            tone === "lime" ? "btn-forest" : "btn-lime"
          }`}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Join the list <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </div>
      {state.status === "error" && state.message && (
        <p className="mt-2 text-xs text-wine" role="alert">
          {state.message}
        </p>
      )}
      <p
        className={`mt-3 text-[0.64rem] leading-relaxed ${
          tone === "lime" ? "text-forest/55" : "text-muted"
        }`}
      >
        New arrivals and considered edits. Unsubscribe whenever you like. Read
        our{" "}
        <a href="/policies/privacy" className="underline underline-offset-2">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
