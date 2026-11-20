"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  consumeVerificationToken,
  createSession,
  destroyCurrentSession,
  hashPassword,
  issueVerificationToken,
  markEmailVerified,
  verifyPassword,
} from "@/lib/auth";
import {
  fieldErrors,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validators";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";
import { takeRateLimit } from "@/lib/rate-limit";
import type { ActionState } from "@/lib/action-state";

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "/account";
}

async function requestKey(prefix: string) {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return `${prefix}:${ip}`;
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const limit = takeRateLimit(await requestKey("login"), 20, 15 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many sign-in attempts. Please wait a few minutes and try again.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return {
      status: "error",
      message: "Email or password is incorrect.",
    };
  }

  await createSession(user.id);
  redirect(safeNext(parsed.data.next ?? null));
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const limit = takeRateLimit(await requestKey("register"), 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many accounts created from this connection. Try again later.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    return {
      status: "error",
      message:
        "An account with this email already exists. Sign in instead, or reset your password.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const token = await issueVerificationToken(user.email, "EMAIL_VERIFICATION");
  const mail = await sendVerificationEmail(user.email, token);

  return {
    status: "success",
    message:
      "Your account is ready. Check your inbox for the verification link, then sign in.",
    devUrl: process.env.NODE_ENV !== "production" ? mail.devUrl : undefined,
  };
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const limit = takeRateLimit(await requestKey("forgot"), 6, 15 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many reset requests. Please wait a few minutes and try again.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { email: true, passwordHash: true },
  });

  let devUrl: string | undefined;
  if (user?.passwordHash) {
    const token = await issueVerificationToken(user.email, "PASSWORD_RESET");
    const mail = await sendPasswordResetEmail(user.email, token);
    devUrl = process.env.NODE_ENV !== "production" ? mail.devUrl : undefined;
  }

  return {
    status: "success",
    message:
      "If an account exists for that email, a password reset link is on its way.",
    devUrl,
  };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const limit = takeRateLimit(await requestKey("reset"), 10, 30 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many attempts. Please request a fresh reset link.",
    };
  }

  const email = await consumeVerificationToken(
    parsed.data.token,
    "PASSWORD_RESET",
  );

  if (!email) {
    return {
      status: "error",
      message:
        "This reset link is invalid or has expired. Request a new password reset email.",
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { status: "error", message: "This account no longer exists." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, emailVerified: user.emailVerified ?? new Date() },
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  redirect("/login?reset=1");
}

export async function verifyEmailAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = formData.get("token");
  if (typeof token !== "string" || token.length < 10) {
    return { status: "error", message: "This verification link is incomplete." };
  }

  const email = await consumeVerificationToken(token, "EMAIL_VERIFICATION");
  if (!email) {
    return {
      status: "error",
      message:
        "This verification link is invalid or has expired. Request a new email below.",
    };
  }

  await markEmailVerified(email);
  redirect("/verify-email?verified=1");
}

export async function resendVerificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const emailValue = formData.get("email");
  const parsed = loginSchema.shape.email.safeParse(emailValue);

  if (!parsed.success) {
    return { status: "error", errors: { email: parsed.error.issues[0].message } };
  }

  const limit = takeRateLimit(await requestKey("resend"), 5, 30 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Please wait a little before requesting another email.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data },
    select: { email: true, emailVerified: true },
  });

  let devUrl: string | undefined;
  if (user && !user.emailVerified) {
    const token = await issueVerificationToken(user.email, "EMAIL_VERIFICATION");
    const mail = await sendVerificationEmail(user.email, token);
    devUrl = process.env.NODE_ENV !== "production" ? mail.devUrl : undefined;
  }

  return {
    status: "success",
    message:
      "If that account still needs verification, a new link is on its way.",
    devUrl,
  };
}

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/login?logout=1");
}
