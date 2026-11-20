"use client";

import { useActionState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { resendVerificationAction } from "@/app/actions/auth";
import { initialActionState } from "@/lib/action-state";

export function ResendVerificationForm({
  defaultEmail = "",
  compact = false,
}: {
  defaultEmail?: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    resendVerificationAction,
    initialActionState,
  );

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-2.5" role="status">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-forest text-lime">
          <Check className="size-3" strokeWidth={2.5} />
        </span>
        <div className="text-[0.78rem] leading-relaxed text-muted">
          <p>{state.message}</p>
          {state.devUrl && (
            <a
              href={state.devUrl}
              className="mt-2 inline-flex items-center gap-1.5 font-semibold text-forest underline underline-offset-4"
            >
              Development verification link <ArrowRight className="size-3" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className={compact ? "space-y-2" : "space-y-3"}>
      <div className={compact ? "flex flex-col gap-2 sm:flex-row" : ""}>
        <div className="flex-1">
          <label htmlFor="resend-email" className="sr-only">
            Email address
          </label>
          <input
            id="resend-email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            autoComplete="email"
            required
            placeholder="Your email address"
            className="field h-11"
            aria-invalid={Boolean(state.errors?.email)}
          />
          {state.errors?.email && (
            <p className="field-error">{state.errors.email}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="btn btn-outline h-11 shrink-0"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>Resend link</>
          )}
        </button>
      </div>
      {state.status === "error" && state.message && (
        <p className="text-[0.72rem] text-wine" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
