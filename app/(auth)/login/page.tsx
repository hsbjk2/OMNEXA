import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { safeRedirectPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your OMNEXA account.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const AUTH_ERRORS: Record<string, string> = {
  "google-unconfigured":
    "Google sign-in is not configured on this deployment. Use your email and password instead.",
  "google-cancelled": "Google sign-in was cancelled. Nothing changed.",
  "google-state":
    "That Google sign-in link expired or could not be verified. Please try again.",
  "google-token": "Google sign-in could not be completed. Please try again.",
  "google-profile":
    "We could not read your Google profile. Please try again or use email.",
  "google-email":
    "Your Google email is not verified, so we cannot use it to sign in.",
  "google-failed":
    "Google sign-in failed. Please try again or sign in with your password.",
  "facebook-unconfigured":
    "Facebook sign-in is not configured on this deployment. Use your email and password instead.",
  "facebook-cancelled": "Facebook sign-in was cancelled. Nothing changed.",
  "facebook-state":
    "That Facebook sign-in link expired or could not be verified. Please try again.",
  "facebook-token": "Facebook sign-in could not be completed. Please try again.",
  "facebook-profile":
    "We could not read your Facebook profile. Please try again or use email.",
  "facebook-email-missing":
    "Facebook did not share an email address. Sign in with your email and password, then try again.",
  "facebook-link":
    "That Facebook account is already linked to a different OMNEXA account.",
  "facebook-failed":
    "Facebook sign-in failed. Please try again or sign in with your password.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next);
  const user = await getCurrentUser();

  const authError =
    typeof params.error === "string"
      ? (AUTH_ERRORS[params.error] ?? null)
      : null;

  if (user) {
    redirect(next ?? (user.role === "ADMIN" ? "/admin" : "/account"));
  }

  return (
    <>
      {authError && (
        <div className="mb-5 flex items-start gap-2.5 border border-wine/25 bg-[#f7eaea] px-4 py-3 text-[0.78rem] leading-relaxed text-wine">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {authError}
        </div>
      )}
      {params.reset === "1" && (
        <div className="mb-5 flex items-start gap-2.5 border border-line bg-light/70 px-4 py-3 text-[0.78rem] leading-relaxed text-forest/70">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-bright" />
          Password updated. Sign in with your new password.
        </div>
      )}
      {params.logout === "1" && (
        <div className="mb-5 flex items-start gap-2.5 border border-line bg-light/70 px-4 py-3 text-[0.78rem] leading-relaxed text-forest/70">
          <LogOut className="mt-0.5 size-4 shrink-0 text-forest/50" />
          You have been signed out.
        </div>
      )}
      <LoginForm next={next} />
    </>
  );
}
