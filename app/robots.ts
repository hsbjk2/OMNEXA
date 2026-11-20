import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/account",
          "/account/",
          "/api/",
          "/cart",
          "/checkout",
          "/wishlist",
          "/order/",
          "/search",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
