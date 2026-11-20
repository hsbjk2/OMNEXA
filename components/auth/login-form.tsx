"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { initialActionState } from "@/lib/action-state";

export function LoginForm({
  next,
  googleEnabled,
}: {
  next?: string;
  googleEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialActionState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <p className="eyebrow text-forest/45">Welcome back</p>
      <h1 className="mt-3 font-display text-[clamp(2.6rem,5vw,3.8rem)] leading-[0.95] tracking-[-0.04em]">
        Sign in to
        <br />
        <span className="italic text-forest/65">your cabinet.</span>
      </h1>
      <p className="mt-4 text-[0.88rem] leading-relaxed text-muted">
        Your bag, wishlist, addresses and order history — all in one place.
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
        {next && <input type="hidden" name="next" value={next} />}
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="mb-2 text-[0.65rem] font-medium text-forest/55 underline underline-offset-4 transition hover:text-forest"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="field pr-11"
              placeholder="Your password"
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
          {state.errors?.password && (
            <p className="field-error">{state.errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-forest mt-2 w-full"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight className="size-3.5" />
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
            href={`/api/auth/google${
              next ? `?next=${encodeURIComponent(next)}` : ""
            }`}
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
        New to OMNEXA?{" "}
        <Link
          href="/register"
          className="font-semibold text-forest underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
