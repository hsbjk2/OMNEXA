/**
 * Six-digit email OTP helpers.
 *
 * Codes are never stored directly. Each code is bound to its email address and
 * hashed with HMAC-SHA256 using a dedicated server-side secret, so a database
 * leak does not expose usable registration codes.
 */

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

export function isOtpConfigured() {
  return Boolean(process.env.OTP_HMAC_SECRET?.trim());
}

function otpSecret() {
  const secret = process.env.OTP_HMAC_SECRET?.trim();
  if (!secret) {
    throw new Error("OTP_HMAC_SECRET is not configured.");
  }
  return secret;
}

/**
 * Returns a uniformly distributed six-digit code using rejection sampling, so
 * the modulo operation does not bias the result.
 */
export function generateOtp() {
  const maximum = 1_000_000;
  const limit = Math.floor(0x1_0000_0000 / maximum) * maximum;
  const buffer = new Uint32Array(1);

  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return String(buffer[0] % maximum).padStart(6, "0");
}

export async function hashOtp(email: string, otp: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(otpSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${email.trim().toLowerCase()}:${otp}`),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyOtpHash(
  email: string,
  otp: string,
  expectedHash: string,
) {
  const actualHash = await hashOtp(email, otp);
  return constantTimeEqual(actualHash, expectedHash);
}
