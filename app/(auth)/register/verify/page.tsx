import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { registrationEmailSchema } from "@/lib/validators";
import { VerifyRegistrationForm } from "@/components/auth/verify-registration-form";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Enter the six-digit code to finish creating your OMNEXA account.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function VerifyRegistrationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  const params = await searchParams;
  const rawEmail = typeof params.email === "string" ? params.email : "";
  const parsed = registrationEmailSchema.safeParse({ email: rawEmail });

  if (!parsed.success) redirect("/register");

  return <VerifyRegistrationForm email={parsed.data.email} />;
}
