import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isGoogleAuthConfigured, setOAuthStateCookie } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

function safeNext(value: string | null) {
  if (!value) return "";
  if (!value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(absoluteUrl("/login?error=google-unconfigured"));
  }

  const { searchParams } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));
  const state = randomBytes(24).toString("base64url");

  await setOAuthStateCookie(JSON.stringify({ state, next }));

  const redirectUri = absoluteUrl("/api/auth/google/callback");
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
