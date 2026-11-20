"use client";

import { useActionState } from "react";
import { AlertCircle, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { verifyEmailAction } from "@/app/actions/auth";
import { initialActionState } from "@/lib/action-state";

export function VerifyEmailForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    verifyEmailAction,
    initialActionState,
  );

  return (
    <div>
      <p className="eyebrow text-forest/45">Email verification</p>
      <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.04em]">
        Confirm your
        <br />
        <span className="italic text-forest/65">email address.</span>
      </h1>
      <p className="mt-4 text-[0.88rem] leading-relaxed text-muted">
        One click confirms this email belongs to you. The link is valid for 24
        hours.
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

      <form action={formAction} className="mt-7">
        <input type="hidden" name="token" value={token} />
        <button type="submit" disabled={pending} className="btn btn-forest w-full">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Verifying…
            </>
          ) : (
            <>
              <MailCheck className="size-4" /> Verify my email
            </>
          )}
        </button>
      </form>
    </div>
  );
}
