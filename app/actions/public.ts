"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { takeRateLimit } from "@/lib/rate-limit";
import {
  contactSchema,
  fieldErrors,
  newsletterSchema,
  waitlistSchema,
} from "@/lib/validators";
import type { ActionState } from "@/lib/action-state";

async function rateKey(prefix: string) {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return `${prefix}:${ip}`;
}

export async function subscribeNewsletterAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const limit = takeRateLimit(await rateKey("newsletter"), 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many requests. Please try again in a little while.",
    };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { active: true },
    create: { email: parsed.data.email },
  });

  revalidatePath("/admin/audience");
  return {
    status: "success",
    message: "You're on the list. We'll write only when there is something worth sharing.",
  };
}

export async function joinWaitlistAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = waitlistSchema.safeParse({
    email: formData.get("email"),
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const limit = takeRateLimit(await rateKey("waitlist"), 20, 60 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many requests. Please try again in a little while.",
    };
  }

  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, isPublished: true },
    select: { id: true, status: true },
  });

  if (!product) {
    return { status: "error", message: "That product could not be found." };
  }

  if (product.status === "AVAILABLE") {
    return {
      status: "error",
      message: "This piece is available now — add it to your bag instead.",
    };
  }

  const user = await getCurrentUser();

  await prisma.waitlistEntry.upsert({
    where: {
      productId_email: {
        productId: product.id,
        email: parsed.data.email,
      },
    },
    update: { userId: user?.id ?? undefined },
    create: {
      productId: product.id,
      email: parsed.data.email,
      userId: user?.id ?? null,
    },
  });

  revalidatePath("/admin/audience");
  return {
    status: "success",
    message: "You're on the notification list. We'll email you when it arrives.",
  };
}

export async function submitContactAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    subject: formData.get("subject"),
    message: formData.get("message"),
    type: formData.get("type") || "GENERAL",
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const limit = takeRateLimit(await rateKey("contact"), 6, 60 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many messages from this connection. Please try again later.",
    };
  }

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
      type: parsed.data.type,
    },
  });

  revalidatePath("/admin/audience");
  return {
    status: "success",
    message:
      "Your message is with our team. We'll reply to the email address you provided.",
  };
}
