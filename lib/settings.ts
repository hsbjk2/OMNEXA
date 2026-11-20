import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { isValidHttpUrl } from "@/lib/utils";

export type StoreSettings = {
  businessName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  mapEmbedUrl: string;
  mapLink: string;
  googleBusinessUrl: string;
  whatsappChannelUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  amazonUrl: string;
  flipkartUrl: string;
  fullAddress: string;
  hasLocation: boolean;
  directionsUrl: string;
};

const defaults = {
  businessName: "OMNEXA",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  contactEmail: process.env.STORE_CONTACT_EMAIL || "care@omnexa.example",
  contactPhone: "",
  whatsapp: "",
  mapEmbedUrl: "",
  mapLink: "",
  googleBusinessUrl: "",
  whatsappChannelUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  amazonUrl: process.env.AMAZON_STORE_URL || "",
  flipkartUrl: process.env.FLIPKART_STORE_URL || "",
};

export const getSiteSettings = cache(async (): Promise<StoreSettings> => {
  let record = null;
  try {
    record = await prisma.siteSettings.findUnique({ where: { id: "site" } });
  } catch {
    record = null;
  }

  const merged = {
    ...defaults,
    businessName: record?.businessName || defaults.businessName,
    addressLine1: record?.addressLine1 || "",
    addressLine2: record?.addressLine2 || "",
    city: record?.city || "",
    state: record?.state || "",
    pincode: record?.pincode || "",
    contactEmail:
      record?.contactEmail || defaults.contactEmail || "care@omnexa.example",
    contactPhone: record?.contactPhone || "",
    whatsapp: record?.whatsapp || "",
    mapEmbedUrl: record?.mapEmbedUrl || "",
    mapLink: record?.mapLink || "",
    googleBusinessUrl: record?.googleBusinessUrl || "",
    whatsappChannelUrl: record?.whatsappChannelUrl || "",
    instagramUrl: record?.instagramUrl || "",
    facebookUrl: record?.facebookUrl || "",
    amazonUrl: record?.amazonUrl || defaults.amazonUrl,
    flipkartUrl: record?.flipkartUrl || defaults.flipkartUrl,
  };

  const parts = [
    merged.addressLine1,
    merged.addressLine2,
    merged.city,
    merged.state,
    merged.pincode,
  ].filter(Boolean);
  const fullAddress = parts.join(", ");
  const query = encodeURIComponent(fullAddress);
  const generatedMapLink = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${query}`
    : "";

  return {
    ...merged,
    fullAddress,
    hasLocation: Boolean(fullAddress),
    directionsUrl: isValidHttpUrl(merged.mapLink)
      ? merged.mapLink
      : generatedMapLink,
    mapLink: isValidHttpUrl(merged.mapLink) ? merged.mapLink : generatedMapLink,
    mapEmbedUrl: isValidHttpUrl(merged.mapEmbedUrl) ? merged.mapEmbedUrl : "",
    googleBusinessUrl: isValidHttpUrl(merged.googleBusinessUrl)
      ? merged.googleBusinessUrl
      : "",
    whatsappChannelUrl: isValidHttpUrl(merged.whatsappChannelUrl)
      ? merged.whatsappChannelUrl
      : "",
  };
});
