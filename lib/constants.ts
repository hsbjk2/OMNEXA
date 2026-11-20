export const SITE_NAME = "OMNEXA";
export const SITE_TAGLINE = "Beauty, elegance & everything you love.";
export const SITE_DESCRIPTION =
  "Shop OMNEXA for considered skincare, makeup, makeup kits, artificial jewellery and everyday beauty essentials. Retail and wholesale availability.";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Coming Soon", href: "/coming-soon" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const POLICY_LINKS = [
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms & Conditions", href: "/policies/terms" },
  { label: "Shipping Policy", href: "/policies/shipping" },
  { label: "Return Policy", href: "/policies/returns" },
] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUSES = ["PENDING", "PAID", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export const PAYMENT_METHODS = ["WHATSAPP", "COD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  WHATSAPP: "WhatsApp order",
  COD: "Cash on delivery",
};

export const PRODUCT_STATUSES = ["AVAILABLE", "OUT_OF_STOCK", "COMING_SOON"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE: "Available",
  OUT_OF_STOCK: "Out of stock",
  COMING_SOON: "Coming soon",
};

export const SORT_OPTIONS = [
  { value: "popular", label: "Popularity" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export const PRICE_FILTERS = [
  { value: "under-1000", label: "Under ₹1,000" },
  { value: "1000-2000", label: "₹1,000 – ₹2,000" },
  { value: "2000-plus", label: "₹2,000 and above" },
] as const;

export const SORT_VALUES = ["popular", "newest", "price-asc", "price-desc"] as const;

export const DEFAULT_SHIPPING_RATE = 79;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 1499;

export function shippingForSubtotal(
  subtotal: number,
  rate = DEFAULT_SHIPPING_RATE,
  threshold = DEFAULT_FREE_SHIPPING_THRESHOLD,
) {
  if (subtotal <= 0) return 0;
  return subtotal >= threshold ? 0 : rate;
}

export const AUTH_COOKIE = "omnexa_session";
export const OAUTH_STATE_COOKIE = "omnexa_oauth_state";
export const SESSION_DAYS = 30;
