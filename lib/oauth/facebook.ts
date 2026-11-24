/**
 * Sign in with Facebook helpers.
 *
 * The Flow uses the Graph API over plain fetch. The optional appsecret_proof
 * is generated with Web Crypto so the same code runs in Node.js and in the
 * Cloudflare Workers runtime.
 */

export const FACEBOOK_AUTHORIZATION_URL =
  "https://www.facebook.com/v27.0/dialog/oauth";
export const FACEBOOK_TOKEN_URL =
  "https://graph.facebook.com/v27.0/oauth/access_token";
export const FACEBOOK_GRAPH_API_URL = "https://graph.facebook.com/v27.0";

export type FacebookProfile = {
  id?: string;
  name?: string;
  email?: string;
  picture?: { data?: { url?: string } };
};

/** Base64url-encoded random state, generated without any Node-only modules. */
export function createOAuthState() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * HMAC-SHA256 of the access token keyed by the app secret. Send this with
 * Graph API requests when the Meta app requires an app secret proof.
 */
export async function createAppSecretProof(
  accessToken: string,
  appSecret: string,
) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(accessToken),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function facebookPictureUrl(profile: FacebookProfile) {
  const url = profile.picture?.data?.url;
  return url?.startsWith("https://") ? url : null;
}
