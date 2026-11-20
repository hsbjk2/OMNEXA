import { NextResponse } from "next/server";
import {
  clearOAuthStateCookie,
  createSession,
  findOrCreateGoogleUser,
  isGoogleAuthConfigured,
  readOAuthStateCookie,
} from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

type GoogleProfile = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function failure(reason: string) {
  return NextResponse.redirect(absoluteUrl(`/login?error=${reason}`));
}

function safeNext(value: unknown) {
  if (typeof value !== "string") return "";
  if (!value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) return failure("google-unconfigured");

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const rawCookie = await readOAuthStateCookie();
  await clearOAuthStateCookie();

  if (oauthError) return failure("google-cancelled");
  if (!code || !state || !rawCookie) return failure("google-state");

  let expected: { state?: string; next?: string } = {};
  try {
    expected = JSON.parse(rawCookie) as { state?: string; next?: string };
  } catch {
    return failure("google-state");
  }

  if (!expected.state || expected.state !== state) return failure("google-state");

  const redirectUri = absoluteUrl("/api/auth/google/callback");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      console.error("Google token exchange failed:", await tokenResponse.text());
      return failure("google-token");
    }

    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) return failure("google-token");

    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
        cache: "no-store",
      },
    );

    if (!profileResponse.ok) return failure("google-profile");

    const profile = (await profileResponse.json()) as GoogleProfile;
    if (!profile.email || profile.email_verified !== true) {
      return failure("google-email");
    }

    const user = await findOrCreateGoogleUser({
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      picture: profile.picture,
    });

    await createSession(user.id);
    const next = safeNext(expected.next);
    return NextResponse.redirect(
      absoluteUrl(next || (user.role === "ADMIN" ? "/admin" : "/account")),
    );
  } catch (error) {
    console.error("Google sign-in failed:", error);
    return failure("google-failed");
  }
}
