import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function discountPercent(price: number, originalPrice?: number | null) {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  return new Intl.DateTimeFormat("en-IN", options).format(new Date(date));
}

export function truncate(value: string, length = 140) {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}

export function absoluteUrl(path = "") {
  const base =
    process.env.APP_ORIGIN ||
    process.env.APP_URL ||
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Returns a same-origin path suitable for a post-login redirect, or undefined
 * when the value could be interpreted as an external URL. Backslashes are
 * normalised to slashes by browsers, so they must be rejected too.
 */
export function safeRedirectPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) {
    return undefined;
  }
  return value;
}

export function isValidHttpUrl(value: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const IMAGE_HOSTS = new Set(["images.pexels.com", "images.unsplash.com"]);

export function isAllowedImageSource(value: string) {
  if (value.startsWith("/")) return !value.startsWith("//");
  if (!isValidHttpUrl(value)) return false;
  try {
    return IMAGE_HOSTS.has(new URL(value).hostname);
  } catch {
    return false;
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
