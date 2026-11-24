"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
} from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { initialActionState } from "@/lib/action-state";
import { SocialLogin } from "@/components/auth/social-login";

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

function passwordScore(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (
    /[^A-Za-z0-9]/.test(password) ||
    (/[a-z]/.test(password) && /[A-Z]/.test(password))
  ) {
    score += 1;
  }
  return score;
}

function strengthColor(score: number) {
  if (score <= 1) return "bg-wine/60";
  if (score === 2) return "bg-[#c9a227]";
  return "bg-forest";
}

export function RegisterForm({
  googleEnabled,
  facebookEnabled,
  defaultEmail = "",
}: {
  googleEnabled: boolean;
  facebookEnabled: boolean;
  defaultEmail?: string;
}) {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialActionState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const redirected = useRef(false);

  const score = passwordScore(password);

  useEffect(() => {
    if (state.status !== "success" || redirected.current) return;

    const email = state.email ?? defaultEmail;
    if (!email) return;

    redirected.current = true;

    if (state.devOtp && process.env.NODE_ENV === "development") {
      try {
        sessionStorage.setItem(`omnexa:dev-otp:${email}`, state.devOtp);
      } catch {
        // Storage can be unavailable in private browsing; the code is still
        // logged by the development mail preview.
      }
    }

    router.replace(`/register/verify?email=${encodeURIComponent(email)}`);
  }, [defaultEmail, router, state]);

  if (state.status === "success") {
    const email = state.email ?? defaultEmail;
    const verifyHref = email
      ? `/register/verify?email=${encodeURIComponent(email)}`
      : "/register";

    return (
      <div>
        <p className="eyebrow text-forest/45">Check your inbox</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.04em]">
          One small step
          <br />
          <span className="italic text-forest/65">left.</span>
        </h1>
        <div className="mt-6 flex items-start gap-3 border border-line bg-light/60 p-4">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-forest text-lime">
            <MailCheck className="size-3.5" strokeWidth={2.4} />
          </span>
          <div>
            <p className="text-sm font-medium text-forest">
              Your code is on its way.
            </p>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
              {state.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[0.76rem] text-muted">
          <Loader2 className="size-3.5 animate-spin" />
          Taking you to the verification page…
        </div>

        <Link href={verifyHref} className="btn btn-forest mt-6 w-full">
          Enter verification code <ArrowRight className="size-3.5" />
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
        Create an account for saved delivery addresses, a persistent bag,
        wishlist, recently viewed products and search history.
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
            defaultValue={defaultEmail}
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field pr-11"
              placeholder="At least 8 characters"
              aria-invalid={Boolean(state.errors?.password)}
              aria-describedby="password-strength"
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

          <div id="password-strength" className="mt-2.5" aria-live="polite">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1 flex-1 transition-colors ${
                    password && index < score
                      ? strengthColor(score)
                      : "bg-line"
                  }`}
                />
              ))}
            </div>
            {password && (
              <p className="mt-1.5 text-[0.68rem] text-muted">
                Password strength:{" "}
                <span className="font-semibold text-forest">
                  {STRENGTH_LABELS[score]}
                </span>
              </p>
            )}
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
              <Loader2 className="size-4 animate-spin" /> Sending your code…
            </>
          ) : (
            <>
              Create account <ArrowRight className="size-3.5" />
            </>
          )}
        </button>

        <p className="flex items-start gap-2 text-[0.68rem] leading-relaxed text-muted/80">
          <Check className="mt-0.5 size-3.5 shrink-0 text-forest" />
          Your account is only created after you verify the six-digit code we
          email you.
        </p>
      </form>

      <SocialLogin
        googleEnabled={googleEnabled}
        facebookEnabled={facebookEnabled}
      />

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
