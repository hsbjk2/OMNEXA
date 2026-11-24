import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getCurrentUser,
  isFacebookAuthConfigured,
  isGoogleAuthConfigured,
} from "@/lib/auth";
import { registrationEmailSchema } from "@/lib/validators";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create an OMNEXA account for saved addresses, a persistent bag, wishlist and browsing history.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  const params = await searchParams;
  const rawEmail = typeof params.email === "string" ? params.email : "";
  const parsedEmail = registrationEmailSchema.safeParse({ email: rawEmail });

  return (
    <RegisterForm
      googleEnabled={isGoogleAuthConfigured()}
      facebookEnabled={isFacebookAuthConfigured()}
      defaultEmail={parsedEmail.success ? parsedEmail.data.email : ""}
    />
  );
}
