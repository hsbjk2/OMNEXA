"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { forgotPasswordAction } from "@/app/actions/auth";
import { initialActionState } from "@/lib/action-state";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialActionState,
  );

  if (state.status === "success") {
    return (
      <div>
        <p className="eyebrow text-forest/45">Check your inbox</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.04em]">
          A reset link
          <br />
          <span className="italic text-forest/65">is on its way.</span>
        </h1>
        <div className="mt-6 flex items-start gap-3 border border-line bg-light/60 p-4">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-forest text-lime">
            <Check className="size-3.5" strokeWidth={2.4} />
          </span>
          <p className="text-[0.82rem] leading-relaxed text-muted">
            {state.message}
          </p>
        </div>
        {state.devUrl && (
          <div className="mt-4 border border-dashed border-forest/25 bg-white p-4 text-[0.74rem] leading-relaxed text-muted">
            <p className="font-semibold text-forest">Development preview</p>
            <p className="mt-1">
              Email delivery is not configured locally. Use the link below to
              test the reset flow.
            </p>
            <a
              href={state.devUrl}
              className="mt-2 inline-flex items-center gap-1.5 font-semibold text-forest underline underline-offset-4"
            >
              Open reset link <ArrowRight className="size-3.5" />
            </a>
          </div>
        )}
        <Link href="/login" className="btn btn-forest mt-6 w-full">
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow text-forest/45">Password help</p>
      <h1 className="mt-3 font-display text-[clamp(2.6rem,5vw,3.8rem)] leading-[0.95] tracking-[-0.04em]">
        Reset your
        <br />
        <span className="italic text-forest/65">password.</span>
      </h1>
      <p className="mt-4 text-[0.88rem] leading-relaxed text-muted">
        Enter the email address on your account and we will send a secure link
        to set a new password.
      </p>

      {state.status === "error" && state.message && (
        <div
          className="mt-6 flex items-start gap-2.5 border border-wine/25 bg-[#f7eaea] px-4 py-3 text-[0.78rem] leading-relaxed text-wine"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      )}

      <form action={formAction} className="mt-7 space-y-4">
        <div>
          <label htmlFor="email" className="field-label">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-forest/30" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="field pl-10"
              placeholder="you@example.com"
              aria-invalid={Boolean(state.errors?.email)}
            />
          </div>
          {state.errors?.email && (
            <p className="field-error">{state.errors.email}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="btn btn-forest w-full"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send reset link <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-[0.8rem] text-muted">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold text-forest underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
