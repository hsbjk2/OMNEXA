import { formatPrice } from "@/lib/utils";
import { parseOrderAddress } from "@/lib/orders";

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

export function buildWhatsAppHref(rawNumber: string, message: string) {
  const digits = whatsAppDigits(rawNumber);
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export type WhatsAppOrder = {
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  shippingAddress: string;
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string | null;
  items: Array<{
    productName: string;
    variant?: string | null;
    quantity: number;
    price: number;
  }>;
};

export function buildOrderWhatsAppMessage(order: WhatsAppOrder) {
  const address = parseOrderAddress(order.shippingAddress);
  const addressLines = [
    address.line1,
    address.line2,
    [address.city, address.state, address.pincode].filter(Boolean).join(" "),
  ].filter(Boolean);

  const itemLines = order.items.map(
    (item) =>
      `• ${item.productName}${item.variant ? ` (${item.variant})` : ""} × ${
        item.quantity
      } — ${formatPrice(item.price * item.quantity)}`,
  );

  const lines = [
    "Hello OMNEXA! I would like to place this order:",
    "",
    `Order: ${order.orderNumber}`,
    "",
    "Items:",
    ...itemLines,
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Delivery: ${
      order.shipping === 0 ? "Complimentary" : formatPrice(order.shipping)
    }`,
    `Total: ${formatPrice(order.total)}`,
    "",
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    "",
    "Deliver to:",
    ...addressLines,
  ];

  if (order.notes) {
    lines.push("", `Notes: ${order.notes}`);
  }

  lines.push(
    "",
    "Please share the payment options so I can complete this order.",
  );

  return lines.join("\n");
}

export function buildOrderWhatsAppHref(
  order: WhatsAppOrder,
  rawNumber: string,
) {
  return buildWhatsAppHref(rawNumber, buildOrderWhatsAppMessage(order));
}

export function buildCustomerChatHref(
  rawNumber: string,
  customerName: string,
  orderNumber: string,
  total: number,
) {
  return buildWhatsAppHref(
    rawNumber,
    `Hello ${customerName}, thank you for your OMNEXA order ${orderNumber} (${formatPrice(
      total,
    )}). Here are the payment options:`,
  );
}
