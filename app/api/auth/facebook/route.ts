import { NextResponse } from "next/server";
import { isFacebookAuthConfigured, setOAuthStateCookie } from "@/lib/auth";
import {
  createOAuthState,
  FACEBOOK_AUTHORIZATION_URL,
} from "@/lib/oauth/facebook";
import { absoluteUrl, safeRedirectPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isFacebookAuthConfigured()) {
    return NextResponse.redirect(
      absoluteUrl("/login?error=facebook-unconfigured"),
    );
  }

  const { searchParams } = new URL(request.url);
  const next = safeRedirectPath(searchParams.get("next")) ?? "";
  const state = createOAuthState();

  await setOAuthStateCookie({ provider: "facebook", state, next });

  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID as string,
    redirect_uri: absoluteUrl("/api/auth/facebook/callback"),
    response_type: "code",
    scope: "email",
    state,
  });

  return NextResponse.redirect(
    `${FACEBOOK_AUTHORIZATION_URL}?${params.toString()}`,
  );
}
