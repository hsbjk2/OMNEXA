import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Confirm the email address on your OMNEXA account.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const verified = params.verified === "1";

  if (verified) {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-light text-forest">
          <CheckCircle2 className="size-6" strokeWidth={1.4} />
        </span>
        <p className="eyebrow mt-6 text-forest/45">Email verified</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.04em]">
          You&apos;re all
          <br />
          <span className="italic text-forest/65">confirmed.</span>
        </h1>
        <p className="mt-4 text-[0.88rem] leading-relaxed text-muted">
          Your email address is now verified. Sign in to manage your account,
          orders, wishlist and addresses.
        </p>
        <Link href="/login" className="btn btn-forest mt-7 w-full">
          Continue to sign in
        </Link>
        <Link
          href="/shop"
          className="mt-4 inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-forest/45 transition hover:text-forest"
        >
          Back to the shop
        </Link>
      </div>
    );
  }

  return (
    <>
      {token ? (
        <VerifyEmailForm token={token} />
      ) : (
        <div>
          <span className="flex size-12 items-center justify-center rounded-full bg-light text-forest">
            <Mail className="size-5" strokeWidth={1.4} />
          </span>
          <p className="eyebrow mt-6 text-forest/45">Email verification</p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.04em]">
            Check your
            <br />
            <span className="italic text-forest/65">inbox.</span>
          </h1>
          <p className="mt-4 text-[0.88rem] leading-relaxed text-muted">
            The verification link opens a confirmation page. If it has expired,
            you can request a fresh one below.
          </p>
        </div>
      )}

      <div className="mt-7 border-t border-line pt-5">
        <p className="eyebrow mb-3 text-forest/40">Resend verification</p>
        <ResendVerificationForm />
      </div>

      <p className="mt-6 text-center text-[0.8rem] text-muted">
        Already verified?{" "}
        <Link
          href="/login"
          className="font-semibold text-forest underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
