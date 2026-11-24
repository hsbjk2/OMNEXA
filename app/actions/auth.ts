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
  registrationEmailSchema,
  registrationOtpSchema,
  resetPasswordSchema,
} from "@/lib/validators";
import {
  sendPasswordResetEmail,
  sendRegistrationOtpEmail,
  sendVerificationEmail,
} from "@/lib/mail";
import {
  cleanupExpiredRateLimits,
  takePersistentRateLimit,
} from "@/lib/persistent-rate-limit";
import {
  generateOtp,
  hashOtp,
  isOtpConfigured,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  verifyOtpHash,
} from "@/lib/otp";
import { takeRateLimit } from "@/lib/rate-limit";
import type { ActionState } from "@/lib/action-state";

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "/account";
}

async function requestIp() {
  const h = await headers();
  // Cloudflare overwrites CF-Connecting-IP at the edge, so it is the reliable
  // client address on Workers. The forwarded headers remain for other hosts
  // and local development.
  return (
    h.get("cf-connecting-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local"
  );
}

async function requestKey(prefix: string) {
  return `${prefix}:${await requestIp()}`;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

/**
 * Resend is treated as a preview success only when email is intentionally
 * unconfigured in development. A configured Resend failure is always an error.
 */
function isEmailPreview(mail: { sent: boolean; reason?: string }) {
  return (
    !mail.sent &&
    process.env.NODE_ENV !== "production" &&
    mail.reason === "not-configured"
  );
}

async function cleanupExpiredPendingRegistrations() {
  try {
    await prisma.pendingRegistration.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  } catch (error) {
    console.error("Could not clean expired pending registrations:", error);
  }
}

async function savePendingRegistration(input: {
  name: string;
  email: string;
  passwordHash: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
}) {
  const { email, ...updates } = input;

  try {
    return await prisma.pendingRegistration.upsert({
      where: { email },
      create: input,
      update: updates,
    });
  } catch (error) {
    // D1 has no interactive transactions. If two first-time requests race,
    // retry the update against the row the other request created.
    if (isUniqueConstraintError(error)) {
      return prisma.pendingRegistration.update({
        where: { email },
        data: updates,
      });
    }
    throw error;
  }
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

  if (!user.emailVerified) {
    return {
      status: "error",
      message:
        "Please verify your email before signing in. Check your inbox for the verification email.",
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

  const email = parsed.data.email;
  const ip = await requestIp();

  const ipLimit = await takePersistentRateLimit(
    `register:ip:${ip}`,
    10,
    60 * 60 * 1000,
  );
  if (!ipLimit.allowed) {
    return {
      status: "error",
      message:
        "Too many registration attempts from this connection. Please wait and try again.",
      retryAfterSeconds: ipLimit.retryAfterSeconds,
    };
  }

  const legacyLimit = takeRateLimit(
    await requestKey("register"),
    10,
    60 * 60 * 1000,
  );
  if (!legacyLimit.allowed) {
    return {
      status: "error",
      message:
        "Too many registration attempts from this connection. Please wait and try again.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return {
      status: "error",
      message:
        "An account with this email already exists. Sign in instead, or reset your password.",
    };
  }

  const emailLimit = await takePersistentRateLimit(
    `register:email:${email}`,
    10,
    60 * 60 * 1000,
  );
  if (!emailLimit.allowed) {
    return {
      status: "error",
      message:
        "Too many registration attempts for this email. Please wait and try again.",
      retryAfterSeconds: emailLimit.retryAfterSeconds,
    };
  }

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email },
    select: { expiresAt: true, lastSentAt: true },
  });
  const now = Date.now();

  if (pending && pending.expiresAt.getTime() > now) {
    const elapsed = now - pending.lastSentAt.getTime();
    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
      return {
        status: "error",
        message: `Please wait ${wait} second${wait === 1 ? "" : "s"} before requesting another code.`,
        retryAfterSeconds: wait,
      };
    }
  }

  if (!isOtpConfigured()) {
    console.error(
      "OTP_HMAC_SECRET is not configured; registration cannot create a verification code.",
    );
    return {
      status: "error",
      message:
        "Registration is temporarily unavailable. Please try again later.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const otp = generateOtp();
  const otpHash = await hashOtp(email, otp);
  const sentAt = new Date();
  const expiresAt = new Date(sentAt.getTime() + OTP_TTL_MS);

  await savePendingRegistration({
    name: parsed.data.name,
    email,
    passwordHash,
    otpHash,
    expiresAt,
    attempts: 0,
    lastSentAt: sentAt,
  });

  const mail = await sendRegistrationOtpEmail(email, otp);
  if (!mail.sent && !isEmailPreview(mail)) {
    // Remove the undelivered code so the customer can retry immediately
    // instead of waiting for the resend cooldown.
    try {
      await prisma.pendingRegistration.deleteMany({
        where: { email, otpHash },
      });
    } catch (error) {
      console.error("Could not remove undelivered pending registration:", error);
    }

    return {
      status: "error",
      message:
        "We could not send the verification code. Please try again in a moment.",
      retryAfterSeconds: 60,
    };
  }

  void cleanupExpiredPendingRegistrations();
  void cleanupExpiredRateLimits();

  return {
    status: "success",
    message:
      "We sent a six-digit code to your email. Enter it to finish creating your account.",
    email,
    devOtp:
      process.env.NODE_ENV === "development" ? mail.devOtp : undefined,
    retryAfterSeconds: 60,
  };
}

export async function verifyRegistrationOtpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registrationOtpSchema.safeParse({
    email: formData.get("email"),
    otp: formData.get("otp"),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const { email, otp } = parsed.data;
  const ip = await requestIp();

  const ipLimit = await takePersistentRateLimit(
    `otp-verify:ip:${ip}`,
    40,
    15 * 60 * 1000,
  );
  if (!ipLimit.allowed) {
    return {
      status: "error",
      message:
        "Too many verification attempts from this connection. Please wait and try again.",
      retryAfterSeconds: ipLimit.retryAfterSeconds,
    };
  }

  const emailLimit = await takePersistentRateLimit(
    `otp-verify:email:${email}`,
    30,
    15 * 60 * 1000,
  );
  if (!emailLimit.allowed) {
    return {
      status: "error",
      message:
        "Too many verification attempts for this email. Request a new code or wait before trying again.",
      retryAfterSeconds: emailLimit.retryAfterSeconds,
    };
  }

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email },
  });

  if (!pending) {
    return {
      status: "error",
      message:
        "This verification code is invalid or has expired. Request a new code.",
    };
  }

  if (pending.expiresAt.getTime() <= Date.now()) {
    await prisma.pendingRegistration.deleteMany({ where: { id: pending.id } });
    return {
      status: "error",
      message:
        "This verification code has expired. Request a new code to continue.",
    };
  }

  if (pending.attempts >= OTP_MAX_ATTEMPTS) {
    return {
      status: "error",
      message:
        "Too many incorrect attempts. Request a new code to try again.",
    };
  }

  let valid = false;
  try {
    valid = await verifyOtpHash(email, otp, pending.otpHash);
  } catch (error) {
    console.error("Could not verify registration OTP:", error);
    return {
      status: "error",
      message: "Verification is temporarily unavailable. Please try again.",
    };
  }

  if (!valid) {
    const updated = await prisma.pendingRegistration.updateMany({
      where: { id: pending.id, attempts: { lt: OTP_MAX_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
    const attemptsUsed =
      pending.attempts + (updated.count === 1 ? 1 : 0);

    if (attemptsUsed >= OTP_MAX_ATTEMPTS) {
      return {
        status: "error",
        message:
          "Too many incorrect attempts. Request a new code to try again.",
      };
    }

    return {
      status: "error",
      message: "That code is incorrect. Check the email and try again.",
    };
  }

  // D1 does not support interactive transactions. A conditional DELETE is a
  // single atomic statement, so only one concurrent verifier can claim this
  // pending row. The unique email constraint is the second serialization point
  // when the permanent User is created.
  const claimed = await prisma.pendingRegistration.deleteMany({
    where: {
      id: pending.id,
      email,
      otpHash: pending.otpHash,
      attempts: { lt: OTP_MAX_ATTEMPTS },
      expiresAt: { gt: new Date() },
    },
  });

  if (claimed.count !== 1) {
    return {
      status: "error",
      message:
        "This code has already been used or is no longer valid. Request a new code or sign in.",
    };
  }

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: pending.name,
        email,
        passwordHash: pending.passwordHash,
        role: "CUSTOMER",
        emailVerified: new Date(),
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message:
          "This account has already been verified. Sign in with your email and password instead.",
      };
    }

    console.error("Could not create verified user after OTP:", error);

    // Best-effort restore so a transient database error does not force the
    // customer to re-enter everything. The conditional claim above already
    // guarantees no other verifier can use this row.
    try {
      await prisma.pendingRegistration.create({
        data: {
          id: pending.id,
          name: pending.name,
          email: pending.email,
          passwordHash: pending.passwordHash,
          otpHash: pending.otpHash,
          expiresAt: pending.expiresAt,
          attempts: pending.attempts,
          lastSentAt: pending.lastSentAt,
          createdAt: pending.createdAt,
        },
      });
    } catch (restoreError) {
      console.error("Could not restore pending registration:", restoreError);
    }

    return {
      status: "error",
      message:
        "We could not finish creating your account. Please try again.",
    };
  }

  try {
    await createSession(user.id);
  } catch (error) {
    console.error("Could not create session after OTP verification:", error);
    return {
      status: "error",
      message:
        "Your account is ready. Sign in with your email and password.",
    };
  }

  redirect("/account");
}

export async function resendRegistrationOtpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registrationEmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const email = parsed.data.email;
  const ip = await requestIp();

  const ipLimit = await takePersistentRateLimit(
    `otp-resend:ip:${ip}`,
    10,
    60 * 60 * 1000,
  );
  if (!ipLimit.allowed) {
    return {
      status: "error",
      message:
        "Too many resend requests from this connection. Please wait and try again.",
      retryAfterSeconds: ipLimit.retryAfterSeconds,
    };
  }

  const emailLimit = await takePersistentRateLimit(
    `otp-resend:email:${email}`,
    5,
    60 * 60 * 1000,
  );
  if (!emailLimit.allowed) {
    return {
      status: "error",
      message:
        "Too many resend requests for this email. Please wait before requesting another code.",
      retryAfterSeconds: emailLimit.retryAfterSeconds,
    };
  }

  const legacyLimit = takeRateLimit(
    await requestKey("otp-resend"),
    10,
    60 * 60 * 1000,
  );
  if (!legacyLimit.allowed) {
    return {
      status: "error",
      message:
        "Too many resend requests from this connection. Please wait and try again.",
    };
  }

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email },
  });

  // Do not reveal whether an arbitrary address has a pending registration.
  if (!pending) {
    return {
      status: "success",
      message:
        "If a registration is pending for that email, a new verification code is on its way.",
      retryAfterSeconds: 60,
    };
  }

  const now = Date.now();
  const elapsed = now - pending.lastSentAt.getTime();

  if (elapsed < OTP_RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
    return {
      status: "error",
      message: `Please wait ${wait} second${wait === 1 ? "" : "s"} before requesting another code.`,
      retryAfterSeconds: wait,
    };
  }

  if (pending.expiresAt.getTime() <= now) {
    await prisma.pendingRegistration.deleteMany({ where: { id: pending.id } });
    return {
      status: "error",
      message:
        "That registration has expired. Please create your account again.",
    };
  }

  if (!isOtpConfigured()) {
    console.error(
      "OTP_HMAC_SECRET is not configured; a new registration code cannot be created.",
    );
    return {
      status: "error",
      message:
        "Registration is temporarily unavailable. Please try again later.",
    };
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(email, otp);
  const sentAt = new Date();
  const expiresAt = new Date(sentAt.getTime() + OTP_TTL_MS);

  await prisma.pendingRegistration.update({
    where: { id: pending.id },
    data: {
      otpHash,
      expiresAt,
      attempts: 0,
      lastSentAt: sentAt,
    },
  });

  const mail = await sendRegistrationOtpEmail(email, otp);
  if (!mail.sent && !isEmailPreview(mail)) {
    return {
      status: "error",
      message:
        "We could not send a new verification code. Please try again shortly.",
      retryAfterSeconds: 60,
    };
  }

  void cleanupExpiredPendingRegistrations();
  void cleanupExpiredRateLimits();

  return {
    status: "success",
    message:
      "A new six-digit code is on its way. It expires in 10 minutes.",
    retryAfterSeconds: 60,
    devOtp:
      process.env.NODE_ENV === "development" ? mail.devOtp : undefined,
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
