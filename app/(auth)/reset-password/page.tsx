import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password for your OMNEXA account.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const email = typeof params.email === "string" ? params.email : "";
  const valid = token.length >= 10 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!valid) {
    return (
      <div>
        <span className="flex size-12 items-center justify-center rounded-full bg-light text-forest">
          <KeyRound className="size-5" strokeWidth={1.4} />
        </span>
        <p className="eyebrow mt-6 text-forest/45">Reset link</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.04em]">
          This link is
          <br />
          <span className="italic text-forest/65">missing something.</span>
        </h1>
        <p className="mt-4 text-[0.88rem] leading-relaxed text-muted">
          Password reset links need a valid token and email address. Request a
          fresh link and try again.
        </p>
        <Link href="/forgot-password" className="btn btn-forest mt-6 w-full">
          Request a new link <ArrowRight className="size-3.5" />
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm email={email} token={token} />;
}
