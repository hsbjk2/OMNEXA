import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
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

export async function setOAuthStateCookie(state: string) {
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
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
