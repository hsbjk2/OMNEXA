import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7faf5",
    theme_color: "#063b20",
    lang: "en-IN",
    dir: "ltr",
    categories: ["shopping", "lifestyle", "beauty"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Shop the edit",
        short_name: "Shop",
        url: "/shop",
      },
      {
        name: "My account",
        short_name: "Account",
        url: "/account",
      },
    ],
  };
}
