import {
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_RATE,
} from "@/lib/constants";

export type ShippingConfig = {
  rate: number;
  threshold: number;
};

export function getShippingConfig(): ShippingConfig {
  const rate = Number(process.env.SHIPPING_FLAT_RATE);
  const threshold = Number(process.env.FREE_SHIPPING_THRESHOLD);
  return {
    rate: Number.isFinite(rate) && rate >= 0 ? rate : DEFAULT_SHIPPING_RATE,
    threshold:
      Number.isFinite(threshold) && threshold >= 0
        ? threshold
        : DEFAULT_FREE_SHIPPING_THRESHOLD,
  };
}
