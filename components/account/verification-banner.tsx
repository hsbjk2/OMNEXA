"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, MailWarning } from "lucide-react";
import { resendVerificationAction } from "@/app/actions/auth";
import { initialActionState } from "@/lib/action-state";

export function VerificationBanner({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    resendVerificationAction,
    initialActionState,
  );

  return (
    <div className="border border-[#e4d9b7] bg-[#faf6e9] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <MailWarning className="mt-0.5 size-5 shrink-0 text-[#7c6524]" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <p className="text-[0.82rem] font-semibold text-[#5f4d1c]">
            Verify your email address
          </p>
          <p className="mt-1 text-[0.76rem] leading-relaxed text-[#756532]">
            We sent a verification link to <span className="font-medium">{email}</span>.
            Verifying it helps us reach you about orders and keeps your account
            secure.
          </p>

          {state.status === "success" && (
            <div className="mt-3 text-[0.76rem] leading-relaxed text-[#3f5b36]">
              <p className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                {state.message}
              </p>
              {state.devUrl && (
                <a
                  href={state.devUrl}
                  className="mt-1 inline-block break-all font-medium underline underline-offset-2"
                >
                  Open verification link (development preview)
                </a>
              )}
            </div>
          )}
          {state.status === "error" && state.message && (
            <p className="mt-2 flex items-start gap-1.5 text-[0.74rem] text-wine">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              {state.message}
            </p>
          )}

          <form action={formAction} className="mt-3">
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#5f4d1c] underline underline-offset-4 transition hover:text-forest disabled:opacity-60"
            >
              {pending && <Loader2 className="size-3 animate-spin" />}
              {pending ? "Sending…" : "Resend verification email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
