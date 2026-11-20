import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  if (!hasSession && (pathname === "/account" || pathname.startsWith("/account/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (!hasSession && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?next=/admin";
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://images.pexels.com https://images.unsplash.com",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-src 'self' https://www.google.com https://maps.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
      ].join("; "),
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|brand/|uploads/|og-omnexa.jpg|icon.png|apple-icon.png|robots.txt|sitemap.xml|manifest.webmanifest).*)",
  ],
};
