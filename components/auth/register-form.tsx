"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { initialActionState } from "@/lib/action-state";

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialActionState,
  );
  const [showPassword, setShowPassword] = useState(false);

  if (state.status === "success") {
    return (
      <div>
        <p className="eyebrow text-forest/45">Account created</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.04em]">
          One small step
          <br />
          <span className="italic text-forest/65">left.</span>
        </h1>
        <div className="mt-6 flex items-start gap-3 border border-line bg-light/60 p-4">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-forest text-lime">
            <Check className="size-3.5" strokeWidth={2.4} />
          </span>
          <div>
            <p className="text-sm font-medium text-forest">
              Your account is ready.
            </p>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
              {state.message}
            </p>
          </div>
        </div>

        {state.devUrl && (
          <div className="mt-4 border border-dashed border-forest/25 bg-white p-4 text-[0.74rem] leading-relaxed text-muted">
            <p className="font-semibold text-forest">
              Development preview
            </p>
            <p className="mt-1">
              Email delivery is not configured, so the verification link is
              shown here for local testing.
            </p>
            <a
              href={state.devUrl}
              className="mt-2 inline-flex items-center gap-1.5 font-semibold text-forest underline underline-offset-4"
            >
              Open verification link <ArrowRight className="size-3.5" />
            </a>
          </div>
        )}

        <Link href="/login" className="btn btn-forest mt-6 w-full">
          Sign in <ArrowRight className="size-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow text-forest/45">Create an account</p>
      <h1 className="mt-3 font-display text-[clamp(2.6rem,5vw,3.8rem)] leading-[0.95] tracking-[-0.04em]">
        Make it
        <br />
        <span className="italic text-forest/65">yours.</span>
      </h1>
      <p className="mt-4 text-[0.88rem] leading-relaxed text-muted">
        Create an account for a faster checkout, saved addresses, a persistent
        wishlist and order history.
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
          <label htmlFor="name" className="field-label">
            Full name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            className="field"
            placeholder="Your name"
            aria-invalid={Boolean(state.errors?.name)}
          />
          {state.errors?.name && (
            <p className="field-error">{state.errors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="field"
            placeholder="you@example.com"
            aria-invalid={Boolean(state.errors?.email)}
          />
          {state.errors?.email && (
            <p className="field-error">{state.errors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              className="field pr-11"
              placeholder="At least 8 characters"
              aria-invalid={Boolean(state.errors?.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/35 transition hover:text-forest"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {state.errors?.password ? (
            <p className="field-error">{state.errors.password}</p>
          ) : (
            <p className="field-hint">
              At least 8 characters, including a letter and a number.
            </p>
          )}
        </div>

        <label className="flex items-start gap-2.5 text-[0.72rem] leading-relaxed text-muted">
          <input
            type="checkbox"
            required
            className="mt-0.5 size-4 accent-forest"
          />
          <span>
            I agree to the{" "}
            <Link href="/policies/terms" className="underline underline-offset-2 hover:text-forest">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/policies/privacy" className="underline underline-offset-2 hover:text-forest">
              privacy policy
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-forest mt-2 w-full"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Creating account…
            </>
          ) : (
            <>
              Create account <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[0.58rem] uppercase tracking-[0.15em] text-muted/50">
              or
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <a
            href="/api/auth/google"
            className="flex h-12 w-full items-center justify-center gap-3 border border-line bg-white text-[0.76rem] font-semibold text-ink transition hover:border-forest"
          >
            <span className="flex size-5 items-center justify-center rounded-full border border-forest/15 font-display text-sm text-forest">
              G
            </span>
            Continue with Google
          </a>
        </>
      )}

      <p className="mt-7 text-center text-[0.8rem] text-muted">
        Already have an account?{" "}
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
