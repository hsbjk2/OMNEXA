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
  whatsappCatalogueUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  amazonUrl: string;
  flipkartUrl: string;
  fullAddress: string;
  hasLocation: boolean;
  directionsUrl: string;
};

const DEFAULT_CONTACT_EMAIL =
  process.env.STORE_CONTACT_EMAIL || "omnexaenterprise@gmail.com";
const DEFAULT_WHATSAPP = process.env.STORE_WHATSAPP || "+91 80599 12655";
const DEFAULT_FLIPKART_URL =
  process.env.FLIPKART_STORE_URL ||
  "https://www.flipkart.com/sellers?pid=ERGHZTUJKZFZVXEF&utm";
const DEFAULT_WHATSAPP_CHANNEL_URL =
  process.env.WHATSAPP_CHANNEL_URL ||
  "https://whatsapp.com/channel/0029VbD0oy79sBI5P6MSla0d";
const DEFAULT_WHATSAPP_CATALOGUE_URL =
  process.env.WHATSAPP_CATALOGUE_URL || "https://wa.me/c/918059912655";
const DEFAULT_INSTAGRAM_URL =
  process.env.INSTAGRAM_URL || "https://www.instagram.com/omnexa.in/";

const defaults = {
  businessName: "OMNEXA",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  contactEmail: DEFAULT_CONTACT_EMAIL,
  contactPhone: DEFAULT_WHATSAPP,
  whatsapp: DEFAULT_WHATSAPP,
  mapEmbedUrl: "",
  mapLink: "",
  googleBusinessUrl: "",
  whatsappChannelUrl: DEFAULT_WHATSAPP_CHANNEL_URL,
  whatsappCatalogueUrl: DEFAULT_WHATSAPP_CATALOGUE_URL,
  instagramUrl: DEFAULT_INSTAGRAM_URL,
  facebookUrl: "",
  amazonUrl: process.env.AMAZON_STORE_URL || "",
  flipkartUrl: DEFAULT_FLIPKART_URL,
};

export const getSiteSettings = cache(async (): Promise<StoreSettings> => {
  let record = null;
  try {
    record = await prisma.siteSettings.findUnique({ where: { id: "site" } });
  } catch (error) {
    // Keep the storefront usable with defaults, but never hide the database
    // error from the server logs.
    console.error(
      "[db] Could not read SiteSettings; falling back to defaults.",
      error,
    );
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
      record?.contactEmail || defaults.contactEmail || DEFAULT_CONTACT_EMAIL,
    contactPhone: record?.contactPhone || defaults.contactPhone,
    whatsapp: record?.whatsapp || defaults.whatsapp,
    mapEmbedUrl: record?.mapEmbedUrl || "",
    mapLink: record?.mapLink || "",
    googleBusinessUrl: record?.googleBusinessUrl || "",
    whatsappChannelUrl:
      record?.whatsappChannelUrl || defaults.whatsappChannelUrl,
    whatsappCatalogueUrl:
      record?.whatsappCatalogueUrl || defaults.whatsappCatalogueUrl,
    instagramUrl: record?.instagramUrl || defaults.instagramUrl,
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
    whatsappCatalogueUrl: isValidHttpUrl(merged.whatsappCatalogueUrl)
      ? merged.whatsappCatalogueUrl
      : "",
    instagramUrl: isValidHttpUrl(merged.instagramUrl) ? merged.instagramUrl : "",
  };
});
