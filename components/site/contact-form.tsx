"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { submitContactAction } from "@/app/actions/public";
import { initialActionState } from "@/lib/action-state";

export function ContactForm({
  type = "GENERAL",
  defaultSubject = "",
  defaultName = "",
  defaultEmail = "",
}: {
  type?: "GENERAL" | "WHOLESALE";
  defaultSubject?: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitContactAction,
    initialActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center border border-line bg-white px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-light text-forest">
          <CheckCircle2 className="size-5" strokeWidth={1.5} />
        </span>
        <p className="mt-4 font-display text-[1.7rem]">Message received.</p>
        <p className="mt-2 max-w-sm text-[0.82rem] leading-relaxed text-muted">
          {state.message}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn btn-outline mt-5"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border border-line bg-white p-5 sm:p-7"
    >
      <input type="hidden" name="type" value={type} />
      {state.status === "error" && state.message && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 border border-wine/25 bg-[#f7eaea] px-3.5 py-2.5 text-[0.78rem] leading-relaxed text-wine"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Full name
          </label>
          <input
            id="contact-name"
            name="name"
            defaultValue={defaultName}
            required
            autoComplete="name"
            className="field"
            aria-invalid={Boolean(state.errors?.name)}
          />
          {state.errors?.name && <p className="field-error">{state.errors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            required
            autoComplete="email"
            className="field"
            aria-invalid={Boolean(state.errors?.email)}
          />
          {state.errors?.email && <p className="field-error">{state.errors.email}</p>}
        </div>
        <div>
          <label htmlFor="contact-phone" className="field-label">
            Phone <span className="font-normal normal-case tracking-normal text-muted/60">(optional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="field"
            aria-invalid={Boolean(state.errors?.phone)}
          />
          {state.errors?.phone && <p className="field-error">{state.errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="contact-subject" className="field-label">
            Subject
          </label>
          <input
            id="contact-subject"
            name="subject"
            defaultValue={defaultSubject}
            required
            maxLength={120}
            className="field"
            aria-invalid={Boolean(state.errors?.subject)}
          />
          {state.errors?.subject && (
            <p className="field-error">{state.errors.subject}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="field-label">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            minLength={10}
            maxLength={2000}
            className="field resize-y"
            placeholder={
              type === "WHOLESALE"
                ? "Tell us about your business, the categories you are interested in, quantities and where you are based."
                : "How can we help?"
            }
            aria-invalid={Boolean(state.errors?.message)}
          />
          {state.errors?.message && (
            <p className="field-error">{state.errors.message}</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[0.66rem] leading-relaxed text-muted/65">
          Your message is stored in the OMNEXA admin inbox. We do not use contact
          details for anything else.
        </p>
        <button type="submit" disabled={pending} className="btn btn-forest">
          {pending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send className="size-3.5" /> Send message
            </>
          )}
        </button>
      </div>
    </form>
  );
}
