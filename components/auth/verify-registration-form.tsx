"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Loader2,
  Mail,
  Pencil,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import {
  resendRegistrationOtpAction,
  verifyRegistrationOtpAction,
} from "@/app/actions/auth";
import { initialActionState, type ActionState } from "@/lib/action-state";

const OTP_LENGTH = 6;

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function emptyDigits() {
  return Array.from({ length: OTP_LENGTH }, () => "");
}

export function VerifyRegistrationForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    verifyRegistrationOtpAction,
    initialActionState,
  );
  const [resendState, resendFormAction, resendPending] = useActionState(
    resendRegistrationOtpAction,
    initialActionState,
  );
  const [digits, setDigits] = useState<string[]>(emptyDigits);
  const [resendIn, setResendIn] = useState(60);
  const [devOtp, setDevOtp] = useState("");
  const [dismissedError, setDismissedError] = useState<ActionState | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const handledResend = useRef<ActionState | null>(null);

  const code = digits.join("");
  const complete = code.length === OTP_LENGTH;

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    try {
      const stored = sessionStorage.getItem(`omnexa:dev-otp:${email}`);
      if (stored) setDevOtp(stored);
    } catch {
      // Private browsing can block storage; the server console still has the
      // development preview.
    }
  }, [email]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(
      () => setResendIn((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => {
    if (resendState.status === "idle") return;
    if (handledResend.current === resendState) return;
    handledResend.current = resendState;

    if (resendState.retryAfterSeconds) {
      setResendIn(resendState.retryAfterSeconds);
    }

    if (resendState.status === "success") {
      setDismissedError(state);
      setDigits(emptyDigits());
      inputs.current[0]?.focus();

      if (resendState.devOtp && process.env.NODE_ENV === "development") {
        setDevOtp(resendState.devOtp);
        try {
          sessionStorage.setItem(
            `omnexa:dev-otp:${email}`,
            resendState.devOtp,
          );
        } catch {
          // Ignore unavailable storage.
        }
      }
    }
  }, [email, resendState, state]);

  function setDigitAt(index: number, rawValue: string) {
    const clean = rawValue.replace(/\D/g, "");

    if (!clean) {
      setDigits((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    if (clean.length > 1) {
      setDigits((current) => {
        const next = [...current];
        for (
          let offset = 0;
          offset < clean.length && index + offset < OTP_LENGTH;
          offset += 1
        ) {
          next[index + offset] = clean[offset];
        }
        return next;
      });
      const focusIndex = Math.min(index + clean.length, OTP_LENGTH - 1);
      inputs.current[focusIndex]?.focus();
      return;
    }

    setDigits((current) => {
      const next = [...current];
      next[index] = clean;
      return next;
    });

    if (index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Backspace") {
      if (digits[index]) {
        setDigits((current) => {
          const next = [...current];
          next[index] = "";
          return next;
        });
        return;
      }

      event.preventDefault();
      if (index > 0) {
        setDigits((current) => {
          const next = [...current];
          next[index - 1] = "";
          return next;
        });
        inputs.current[index - 1]?.focus();
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next = emptyDigits();
    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setDigits(next);
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  function fillDevelopmentCode() {
    if (!/^\d{6}$/.test(devOtp)) return;
    setDigits(devOtp.split(""));
    inputs.current[OTP_LENGTH - 1]?.focus();
  }

  return (
    <div>
      <p className="eyebrow text-forest/45">Verify your email</p>
      <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.04em]">
        Enter the code
        <br />
        <span className="italic text-forest/65">we sent you.</span>
      </h1>
      <p className="mt-4 text-[0.88rem] leading-relaxed text-muted">
        We sent a six-digit code to{" "}
        <span className="font-semibold text-forest">{email}</span>. It expires
        in 10 minutes.
      </p>

      <div className="mt-5 flex items-start gap-2.5 border border-line bg-light/60 px-4 py-3 text-[0.74rem] leading-relaxed text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest" />
        <span>
          Your account is not created until this code is verified. Never share
          this code with anyone.
        </span>
      </div>

      {state.status === "error" &&
        state.message &&
        state !== dismissedError && (
        <div
          className="mt-6 flex items-start gap-2.5 border border-wine/25 bg-[#f7eaea] px-4 py-3 text-[0.78rem] leading-relaxed text-wine"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            {state.message}
            {state.message.includes("already been verified") && (
              <>
                {" "}
                <Link
                  href="/login"
                  className="font-semibold underline underline-offset-2"
                >
                  Sign in
                </Link>
              </>
            )}
          </span>
        </div>
      )}

      <form action={formAction} className="mt-6">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value={code} />

        <fieldset>
          <legend className="field-label">Six-digit verification code</legend>
          <div className="mt-2 flex justify-between gap-2 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(event) => setDigitAt(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onPaste={handlePaste}
                onFocus={(event) => event.target.select()}
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                aria-invalid={Boolean(state.errors?.otp)}
                className="field h-14 min-w-0 flex-1 px-0 text-center font-display text-2xl tracking-[0.08em] sm:h-16 sm:text-3xl"
              />
            ))}
          </div>
          {state.errors?.otp && (
            <p className="field-error">{state.errors.otp}</p>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={pending || !complete}
          className="btn btn-forest mt-5 w-full"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Verifying…
            </>
          ) : (
            <>
              Verify and create account <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-3 text-center">
        <form action={resendFormAction}>
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={resendPending || resendIn > 0}
            className="inline-flex items-center gap-2 text-[0.74rem] font-semibold text-forest underline underline-offset-4 transition disabled:cursor-not-allowed disabled:text-muted/60 disabled:no-underline"
          >
            {resendPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RotateCw className="size-3.5" />
            )}
            {resendPending
              ? "Sending a new code…"
              : resendIn > 0
                ? `Resend code in ${formatSeconds(resendIn)}`
                : "Resend code"}
          </button>
        </form>

        <Link
          href={`/register?email=${encodeURIComponent(email)}`}
          className="inline-flex items-center gap-1.5 text-[0.72rem] text-muted transition hover:text-forest"
        >
          <Pencil className="size-3" /> Change email address
        </Link>
      </div>

      {resendState.status === "success" && resendState.message && (
        <div
          className="mt-4 flex items-start gap-2.5 border border-line bg-light/60 px-4 py-3 text-[0.74rem] leading-relaxed text-muted"
          role="status"
        >
          <Check className="mt-0.5 size-4 shrink-0 text-forest" />
          {resendState.message}
        </div>
      )}

      {resendState.status === "error" &&
        resendState.message &&
        !(resendIn <= 0 && /^Please wait/.test(resendState.message)) && (
          <div
            className="mt-4 flex items-start gap-2.5 border border-wine/25 bg-[#f7eaea] px-4 py-3 text-[0.74rem] leading-relaxed text-wine"
            role="alert"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {resendState.message}
          </div>
        )}

      {devOtp && process.env.NODE_ENV === "development" && (
        <div className="mt-4 border border-dashed border-forest/25 bg-white p-4 text-[0.72rem] leading-relaxed text-muted">
          <p className="flex items-center gap-1.5 font-semibold text-forest">
            <Mail className="size-3.5" /> Development preview
          </p>
          <p className="mt-1">
            Email delivery is not configured. Your verification code is:
          </p>
          <button
            type="button"
            onClick={fillDevelopmentCode}
            className="mt-2 font-display text-xl tracking-[0.2em] text-forest underline underline-offset-4"
          >
            {devOtp}
          </button>
        </div>
      )}

      <p className="mt-7 text-center text-[0.8rem] text-muted">
        Already verified?{" "}
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
