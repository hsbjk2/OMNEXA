import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isGoogleAuthConfigured } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create an OMNEXA account for saved addresses, a persistent bag, wishlist and browsing history.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  return <RegisterForm googleEnabled={isGoogleAuthConfigured()} />;
}
