"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import {
  changePasswordAction,
  updateProfileAction,
} from "@/app/actions/account";
import { initialActionState } from "@/lib/action-state";
import type { ActionState } from "@/lib/action-state";
import type { SessionUser } from "@/lib/auth";

function Feedback({ state }: { state: ActionState }) {
  if (state.status === "success") {
    return (
      <div className="flex items-start gap-2 border border-line bg-light/70 px-3.5 py-2.5 text-[0.76rem] leading-relaxed text-forest">
        <Check className="mt-0.5 size-3.5 shrink-0" />
        {state.message}
      </div>
    );
  }
  if (state.status === "error" && state.message) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 border border-wine/25 bg-[#f7eaea] px-3.5 py-2.5 text-[0.76rem] leading-relaxed text-wine"
      >
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
        {state.message}
      </div>
    );
  }
  return null;
}

export function ProfileForm({ user }: { user: SessionUser }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialActionState,
  );

  return (
    <section className="border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line px-5 py-4">
        <UserRound className="size-4 text-forest/45" strokeWidth={1.5} />
        <div>
          <p className="eyebrow text-forest/45">Personal details</p>
          <h2 className="mt-0.5 font-display text-[1.45rem] leading-tight">
            How we address you
          </h2>
        </div>
      </div>
      <form action={formAction} className="space-y-4 p-5">
        <Feedback state={state} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="field-label">
              Full name
            </label>
            <input
              id="profile-name"
              name="name"
              defaultValue={user.name}
              required
              autoComplete="name"
              className="field"
              aria-invalid={Boolean(state.errors?.name)}
            />
            {state.errors?.name && <p className="field-error">{state.errors.name}</p>}
          </div>
          <div>
            <label htmlFor="profile-phone" className="field-label">
              Phone <span className="font-normal normal-case tracking-normal text-muted/60">(optional)</span>
            </label>
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              defaultValue={user.phone ?? ""}
              autoComplete="tel"
              className="field"
              placeholder="For delivery questions"
              aria-invalid={Boolean(state.errors?.phone)}
            />
            {state.errors?.phone && <p className="field-error">{state.errors.phone}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="profile-email" className="field-label">
            Email address
          </label>
          <input
            id="profile-email"
            type="email"
            value={user.email}
            readOnly
            disabled
            className="field"
          />
          <p className="field-hint">
            Your sign-in email is fixed. Contact us if it needs to change.
          </p>
        </div>
        <div className="flex justify-end border-t border-line pt-4">
          <button type="submit" disabled={pending} className="btn btn-forest">
            {pending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Saving…
              </>
            ) : (
              "Save details"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialActionState,
  );
  const [show, setShow] = useState(false);

  return (
    <section className="border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line px-5 py-4">
        <LockKeyhole className="size-4 text-forest/45" strokeWidth={1.5} />
        <div>
          <p className="eyebrow text-forest/45">Security</p>
          <h2 className="mt-0.5 font-display text-[1.45rem] leading-tight">
            Change your password
          </h2>
        </div>
      </div>
      {!hasPassword ? (
        <div className="p-5 text-[0.82rem] leading-relaxed text-muted">
          This account signs in with Google and does not yet have a password.
          Use the password reset flow from the sign-in page to set one, or
          continue with Google.
        </div>
      ) : (
        <form action={formAction} className="space-y-4 p-5">
          <Feedback state={state} />
          <div>
            <label htmlFor="currentPassword" className="field-label">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="field"
              aria-invalid={Boolean(state.errors?.currentPassword)}
            />
            {state.errors?.currentPassword && (
              <p className="field-error">{state.errors.currentPassword}</p>
            )}
          </div>
          <div>
            <label htmlFor="newPassword" className="field-label">
              New password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={show ? "text" : "password"}
                required
                autoComplete="new-password"
                minLength={8}
                className="field pr-11"
                aria-invalid={Boolean(state.errors?.newPassword)}
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                aria-label={show ? "Hide new password" : "Show new password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/35 transition hover:text-forest"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {state.errors?.newPassword ? (
              <p className="field-error">{state.errors.newPassword}</p>
            ) : (
              <p className="field-hint">
                At least 8 characters, including a letter and a number. Changing
                your password signs out other devices.
              </p>
            )}
          </div>
          <div className="flex justify-end border-t border-line pt-4">
            <button type="submit" disabled={pending} className="btn btn-forest">
              {pending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export function ProfileForms({
  user,
  hasPassword,
}: {
  user: SessionUser;
  hasPassword: boolean;
}) {
  return (
    <div className="space-y-5">
      <ProfileForm user={user} />
      <PasswordForm hasPassword={hasPassword} />
    </div>
  );
}
