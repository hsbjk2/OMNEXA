import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { OrderRequestForm } from "@/components/order/order-request-form";

export const metadata: Metadata = {
  title: "Order via WhatsApp",
  description:
    "Prepare your OMNEXA product enquiry with delivery details and continue the conversation on WhatsApp.",
  robots: { index: false, follow: false },
};

export default async function OrderRequestPage() {
  const user = await getCurrentUser();
  const [addresses, settings] = await Promise.all([
    user
      ? prisma.address.findMany({
          where: { userId: user.id },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        })
      : Promise.resolve([]),
    getSiteSettings(),
  ]);

  return (
    <OrderRequestForm
      whatsappConfigured={isWhatsAppConfigured(settings.whatsapp)}
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
