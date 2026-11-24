import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { Prisma, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE, OAUTH_STATE_COOKIE, SESSION_DAYS } from "@/lib/constants";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN" | string;
  emailVerified: string | null;
  phone: string | null;
  image: string | null;
  createdAt: string;
};

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  emailVerified: true,
  phone: true,
  image: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

type DbPublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

function toSessionUser(user: DbPublicUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
    phone: user.phone,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
  };
}

export function hashSessionToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string | null) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const raw = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(raw);
  const headerBag = await headers();
  const userAgent = headerBag.get("user-agent")?.slice(0, 255) ?? null;
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { tokenHash, userId, expiresAt, userAgent },
  });

  const store = await cookies();
  store.set(AUTH_COOKIE, raw, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return raw;
}

export async function destroyCurrentSession() {
  const store = await cookies();
  const raw = store.get(AUTH_COOKIE)?.value;
  if (raw) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(raw) },
    });
  }
  store.delete(AUTH_COOKIE);
}

export async function destroyAllSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(AUTH_COOKIE)?.value;
  if (!raw) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(raw) },
    select: {
      expiresAt: true,
      user: { select: publicUserSelect },
    },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(raw) },
    });
    return null;
  }

  return toSessionUser(session.user);
}

export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${next}`);
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/account?restricted=1");
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

const TOKEN_TTL: Record<string, number> = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
};

export async function issueVerificationToken(
  email: string,
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
) {
  const raw = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(raw);
  const expiresAt = new Date(Date.now() + (TOKEN_TTL[type] ?? 3_600_000));

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { email: email.toLowerCase(), type },
    }),
    prisma.verificationToken.create({
      data: {
        email: email.toLowerCase(),
        tokenHash,
        type,
        expiresAt,
      },
    }),
  ]);

  return raw;
}

export async function consumeVerificationToken(
  raw: string,
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
) {
  if (!raw) return null;
  const tokenHash = hashSessionToken(raw);
  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.type !== type) return null;

  if (record.expiresAt.getTime() <= Date.now()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return null;
  }

  await prisma.verificationToken.delete({ where: { id: record.id } });
  return record.email;
}

export async function markEmailVerified(email: string) {
  await prisma.user.updateMany({
    where: { email: email.toLowerCase() },
    data: { emailVerified: new Date() },
  });
}

export async function findOrCreateGoogleUser(input: {
  email: string;
  name: string;
  picture?: string;
}) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.emailVerified) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { emailVerified: new Date() },
      });
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      email,
      name: input.name || email.split("@")[0],
      image: input.picture ?? null,
      emailVerified: new Date(),
      role: "CUSTOMER",
    },
  });
}

export type OAuthProvider = "google" | "facebook";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function findOrCreateFacebookUser(input: {
  facebookSub: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
}): Promise<
  | { user: User }
  | { error: "facebook-email-missing" | "facebook-link" }
> {
  const facebookSub = input.facebookSub.trim();
  if (!facebookSub) return { error: "facebook-email-missing" };

  // Facebook returns the stable user id with every authorization, so a linked
  // account is the primary lookup and works even when the email changes.
  const linked = await prisma.user.findUnique({ where: { facebookSub } });
  if (linked) return { user: linked };

  const email = input.email?.trim().toLowerCase();
  if (!email) return { error: "facebook-email-missing" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.facebookSub && existing.facebookSub !== facebookSub) {
      return { error: "facebook-link" };
    }

    try {
      const user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          facebookSub,
          // Facebook's Graph API does not expose an email-verified flag, so
          // linking it must not silently upgrade an unverified address.
          image: existing.image ?? input.picture ?? null,
        },
      });
      return { user };
    } catch (error) {
      // Another account already owns this Facebook id. Never sign into that
      // account just because the email matched this one; require a manual
      // resolution instead.
      if (isUniqueConstraintError(error)) return { error: "facebook-link" };
      throw error;
    }
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: input.name?.trim() || email.split("@")[0],
        image: input.picture ?? null,
        facebookSub,
        // Facebook does not tell us whether the address is verified. Leave
        // emailVerified unset until a separate verification proves it.
        role: "CUSTOMER",
      },
    });
    return { user };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      // A concurrent first sign-in may have created the same Facebook account.
      // Only reuse it when the email also matches; otherwise report a link
      // conflict rather than authenticating an unrelated user.
      const raced = await prisma.user.findUnique({ where: { facebookSub } });
      if (raced && raced.email.toLowerCase() === email) {
        return { user: raced };
      }
      return { error: "facebook-link" };
    }
    throw error;
  }
}

export async function setOAuthStateCookie(input: {
  provider: OAuthProvider;
  state: string;
  next?: string;
}) {
  const store = await cookies();
  const origin = process.env.APP_ORIGIN || process.env.APP_URL || "";
  const secure =
    origin.startsWith("https://") || process.env.NODE_ENV === "production";

  store.set(OAUTH_STATE_COOKIE, JSON.stringify(input), {
    httpOnly: true,
    // Both providers return the authorization result with a top-level GET
    // redirect, so Lax is sufficient and works with local HTTP development.
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 10 * 60,
  });
}

export async function readOAuthStateCookie() {
  const store = await cookies();
  return store.get(OAUTH_STATE_COOKIE)?.value ?? null;
}

export async function clearOAuthStateCookie() {
  const store = await cookies();
  store.delete(OAUTH_STATE_COOKIE);
}

export function isGoogleAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function isFacebookAuthConfigured() {
  return Boolean(
    process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET,
  );
}
