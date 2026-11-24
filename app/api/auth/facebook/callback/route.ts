import { NextResponse } from "next/server";
import {
  clearOAuthStateCookie,
  createSession,
  findOrCreateFacebookUser,
  isFacebookAuthConfigured,
  readOAuthStateCookie,
} from "@/lib/auth";
import {
  createAppSecretProof,
  facebookPictureUrl,
  FACEBOOK_GRAPH_API_URL,
  FACEBOOK_TOKEN_URL,
  type FacebookProfile,
} from "@/lib/oauth/facebook";
import { absoluteUrl, safeRedirectPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

function failure(reason: string) {
  return NextResponse.redirect(absoluteUrl(`/login?error=${reason}`));
}

export async function GET(request: Request) {
  if (!isFacebookAuthConfigured()) return failure("facebook-unconfigured");

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const rawCookie = await readOAuthStateCookie();
  await clearOAuthStateCookie();

  if (oauthError) {
    return failure(
      oauthError === "access_denied" ? "facebook-cancelled" : "facebook-failed",
    );
  }
  if (!code || !state || !rawCookie) return failure("facebook-state");

  let expected: { provider?: string; state?: string; next?: string } = {};
  try {
    expected = JSON.parse(rawCookie) as {
      provider?: string;
      state?: string;
      next?: string;
    };
  } catch {
    return failure("facebook-state");
  }

  if (expected.provider !== "facebook") return failure("facebook-state");
  if (!expected.state || expected.state !== state) {
    return failure("facebook-state");
  }

  const appId = process.env.FACEBOOK_APP_ID as string;
  const appSecret = process.env.FACEBOOK_APP_SECRET as string;
  const redirectUri = absoluteUrl("/api/auth/facebook/callback");

  try {
    const tokenResponse = await fetch(FACEBOOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      console.error(
        "Facebook token exchange failed with status",
        tokenResponse.status,
      );
      return failure("facebook-token");
    }

    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) return failure("facebook-token");

    const proof = await createAppSecretProof(token.access_token, appSecret);
    const profileUrl = new URL(`${FACEBOOK_GRAPH_API_URL}/me`);
    profileUrl.searchParams.set("fields", "id,name,email,picture");
    profileUrl.searchParams.set("access_token", token.access_token);
    profileUrl.searchParams.set("appsecret_proof", proof);

    const profileResponse = await fetch(profileUrl, { cache: "no-store" });
    if (!profileResponse.ok) {
      console.error(
        "Facebook profile request failed with status",
        profileResponse.status,
      );
      return failure("facebook-profile");
    }

    const profile = (await profileResponse.json()) as FacebookProfile;
    if (!profile.id) return failure("facebook-profile");

    const result = await findOrCreateFacebookUser({
      facebookSub: profile.id,
      email: profile.email,
      name: profile.name,
      picture: facebookPictureUrl(profile),
    });

    if ("error" in result) return failure(result.error);

    await createSession(result.user.id);
    const next = safeRedirectPath(expected.next) ?? "";
    return NextResponse.redirect(
      absoluteUrl(next || (result.user.role === "ADMIN" ? "/admin" : "/account")),
    );
  } catch (error) {
    console.error("Facebook sign-in failed:", error);
    return failure("facebook-failed");
  }
}
