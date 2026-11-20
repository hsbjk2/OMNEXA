import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = {
  title: "Addresses",
  description: "Manage your saved OMNEXA delivery addresses.",
  robots: { index: false, follow: false },
};

export default async function AccountAddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <AddressManager
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
