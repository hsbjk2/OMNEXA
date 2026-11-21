"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroyAllSessions,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import {
  addressSchema,
  changePasswordSchema,
  fieldErrors,
  profileSchema,
} from "@/lib/validators";
import type { ActionState } from "@/lib/action-state";

type CurrentUserResult =
  | { user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> }
  | { error: ActionState };

async function currentUserId(): Promise<CurrentUserResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: { status: "error", message: "Please sign in to continue." } };
  }
  return { user };
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const current = await currentUserId();
  if ("error" in current) return current.error;

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || "",
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  await prisma.user.update({
    where: { id: current.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ? parsed.data.phone : null,
    },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
  revalidatePath("/order-request");
  return { status: "success", message: "Your profile has been updated." };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const current = await currentUserId();
  if ("error" in current) return current.error;

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const user = await prisma.user.findUnique({
    where: { id: current.user.id },
    select: { passwordHash: true },
  });

  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return {
      status: "error",
      errors: { currentPassword: "Your current password is incorrect." },
    };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: current.user.id },
    data: { passwordHash },
  });

  await destroyAllSessions(current.user.id);
  await createSession(current.user.id);

  return {
    status: "success",
    message: "Password changed. Other signed-in sessions have been ended.",
  };
}

export async function saveAddressAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const current = await currentUserId();
  if ("error" in current) return current.error;

  const parsed = addressSchema.safeParse({
    id: formData.get("id") || undefined,
    label: formData.get("label") || "Home",
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || "",
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  if (data.id) {
    const existing = await prisma.address.findFirst({
      where: { id: data.id, userId: current.user.id },
      select: { id: true },
    });
    if (!existing) {
      return { status: "error", message: "That address could not be found." };
    }
  } else {
    const count = await prisma.address.count({ where: { userId: current.user.id } });
    if (count >= 6) {
      return {
        status: "error",
        message: "You can save up to six delivery addresses.",
      };
    }
  }

  const makeDefault = data.isDefault || (await prisma.address.count({ where: { userId: current.user.id } })) === 0;

  // D1 only supports batch transactions, not callback-based interactive ones.
  const operations: Prisma.PrismaPromise<unknown>[] = [];
  if (makeDefault) {
    operations.push(
      prisma.address.updateMany({
        where: { userId: current.user.id },
        data: { isDefault: false },
      }),
    );
  }

  const payload = {
    label: data.label,
    fullName: data.fullName,
    phone: data.phone,
    line1: data.line1,
    line2: data.line2 || null,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    isDefault: makeDefault,
  };

  operations.push(
    data.id
      ? prisma.address.update({ where: { id: data.id }, data: payload })
      : prisma.address.create({
          data: { ...payload, userId: current.user.id },
        }),
  );

  await prisma.$transaction(operations);

  revalidatePath("/account/addresses");
  revalidatePath("/order-request");
  return {
    status: "success",
    message: data.id ? "Address updated." : "Address saved.",
  };
}

export async function deleteAddressAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const current = await currentUserId();
  if ("error" in current) return current.error;

  const id = formData.get("id");
  if (typeof id !== "string") {
    return { status: "error", message: "Missing address." };
  }

  await prisma.address.deleteMany({
    where: { id, userId: current.user.id },
  });

  revalidatePath("/account/addresses");
  revalidatePath("/order-request");
  return { status: "success", message: "Address removed." };
}

export async function setDefaultAddressAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const current = await currentUserId();
  if ("error" in current) return current.error;

  const id = formData.get("id");
  if (typeof id !== "string") {
    return { status: "error", message: "Missing address." };
  }

  const existing = await prisma.address.findFirst({
    where: { id, userId: current.user.id },
    select: { id: true },
  });
  if (!existing) return { status: "error", message: "Address not found." };

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: current.user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
  revalidatePath("/order-request");
  return { status: "success", message: "Default address updated." };
}
