"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";
import { initialActionState } from "@/lib/action-state";

export function ResetPasswordForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialActionState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState("");

  return (
    <div>
      <p className="eyebrow text-forest/45">New password</p>
      <h1 className="mt-3 font-display text-[clamp(2.6rem,5vw,3.8rem)] leading-[0.95] tracking-[-0.04em]">
        Start with a
        <br />
        <span className="italic text-forest/65">fresh key.</span>
      </h1>
      <p className="mt-4 text-[0.88rem] leading-relaxed text-muted">
        Set a new password for{" "}
        <span className="font-medium text-forest">{email}</span>. For security,
        all existing sessions will be signed out.
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

      <form
        action={formAction}
        className="mt-7 space-y-4"
        onSubmit={(event) => {
          if (confirm !== (event.currentTarget.elements.namedItem("password") as HTMLInputElement)?.value) {
            event.preventDefault();
            setConfirmError("The passwords do not match.");
          } else {
            setConfirmError("");
          }
        }}
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" value={token} />
        <div>
          <label htmlFor="password" className="field-label">
            New password
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
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
        <div>
          <label htmlFor="confirm-password" className="field-label">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
              if (confirmError) setConfirmError("");
            }}
            autoComplete="new-password"
            required
            className="field"
            placeholder="Repeat your new password"
            aria-invalid={Boolean(confirmError)}
          />
          {confirmError && <p className="field-error">{confirmError}</p>}
        </div>

        <button type="submit" disabled={pending} className="btn btn-forest w-full">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Updating…
            </>
          ) : (
            <>
              Set new password <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-[0.8rem] text-muted">
        Need a new link?{" "}
        <Link
          href="/forgot-password"
          className="font-semibold text-forest underline underline-offset-4"
        >
          Request one again
        </Link>
      </p>
    </div>
  );
}
