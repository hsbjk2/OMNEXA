import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your OMNEXA order with cash on delivery.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const addresses = user
    ? await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <CheckoutForm
      addresses={addresses.map((address) => ({
        id: address.id,
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
      }))}
    />
  );
}
