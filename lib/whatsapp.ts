import { formatPrice } from "@/lib/utils";

/**
 * Normalises an Indian phone number into the international digits that wa.me
 * expects. The store settings may hold "+91 86076 83463", "8607683463" or an
 * already-normalised value, so accept all three.
 */
export function whatsAppDigits(raw: string) {
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = `91${digits.slice(1)}`;
  } else if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

export function isWhatsAppConfigured(raw: string) {
  return whatsAppDigits(raw).length >= 10;
}

export function buildWhatsAppHref(rawNumber: string, message: string) {
  const digits = whatsAppDigits(rawNumber);
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_ENQUIRY_NOTE =
  "This is an enquiry, not a confirmed order. Availability, delivery charges, the final total and payment arrangements are confirmed by OMNEXA on WhatsApp.";

export type WhatsAppEnquiryItem = {
  name: string;
  variant?: string | null;
  quantity: number;
  unitPrice: number;
  productUrl: string;
  imageUrl?: string | null;
};

export type WhatsAppProductEnquiry = {
  name: string;
  variant?: string | null;
  quantity: number;
  price: number | null;
  productUrl: string;
  imageUrl?: string | null;
};

export type WhatsAppCartEnquiry = {
  customerName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  notes?: string | null;
  items: WhatsAppEnquiryItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

export function buildProductEnquiryMessage(product: WhatsAppProductEnquiry) {
  const lines = [
    "Hello OMNEXA Team!",
    "",
    "I am interested in purchasing this product:",
    "",
    `Product: ${product.name}`,
  ];

  if (product.variant) {
    lines.push(`Variant: ${product.variant}`);
  }

  lines.push(`Quantity: ${product.quantity}`);

  if (product.price !== null && product.price > 0) {
    lines.push(
      `Price: ${formatPrice(product.price)} each`,
      `Estimated total: ${formatPrice(product.price * product.quantity)}`,
    );
  } else {
    lines.push("Price: To be confirmed by the seller");
  }

  lines.push(`Product link: ${product.productUrl}`);

  if (product.imageUrl) {
    lines.push(`Image: ${product.imageUrl}`);
  }

  lines.push(
    "",
    "Please share availability, delivery charges and payment details.",
    "",
    WHATSAPP_ENQUIRY_NOTE,
  );

  return lines.join("\n");
}

export function buildProductEnquiryHref(
  rawNumber: string,
  product: WhatsAppProductEnquiry,
) {
  return buildWhatsAppHref(rawNumber, buildProductEnquiryMessage(product));
}

export function buildCartEnquiryMessage(enquiry: WhatsAppCartEnquiry) {
  const itemLines = enquiry.items.flatMap((item, index) => {
    const lines = [
      `${index + 1}. ${item.name}`,
      `   Quantity: ${item.quantity}`,
    ];

    if (item.variant) {
      lines.push(`   Variant: ${item.variant}`);
    }

    lines.push(
      `   Unit price: ${formatPrice(item.unitPrice)}`,
      `   Line total: ${formatPrice(item.unitPrice * item.quantity)}`,
      `   Product: ${item.productUrl}`,
    );

    if (item.imageUrl) {
      lines.push(`   Image: ${item.imageUrl}`);
    }

    return lines;
  });

  const addressLines = [
    enquiry.line1,
    enquiry.line2,
    [enquiry.city, enquiry.state, enquiry.pincode].filter(Boolean).join(", "),
  ].filter(Boolean);

  const lines = [
    "Hello OMNEXA Team!",
    "",
    "I would like to enquire about these products:",
    "",
    ...itemLines,
    "",
    `Estimated product value: ${formatPrice(enquiry.subtotal)}`,
    `Estimated delivery: ${
      enquiry.shipping === 0
        ? "Complimentary (to be confirmed)"
        : formatPrice(enquiry.shipping)
    }`,
    `Estimated total: ${formatPrice(enquiry.total)}`,
    "",
    "Delivery details:",
    `Name: ${enquiry.customerName}`,
    `Mobile: ${enquiry.phone}`,
    "Address:",
    ...addressLines,
  ];

  if (enquiry.notes) {
    lines.push(`Delivery notes: ${enquiry.notes}`);
  }

  lines.push(
    "",
    "Please confirm availability, delivery charges and payment arrangements.",
    "",
    WHATSAPP_ENQUIRY_NOTE,
  );

  return lines.join("\n");
}

export function buildCartEnquiryHref(
  rawNumber: string,
  enquiry: WhatsAppCartEnquiry,
) {
  return buildWhatsAppHref(rawNumber, buildCartEnquiryMessage(enquiry));
}
