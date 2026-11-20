"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getShippingConfig } from "@/lib/shipping";
import { getSiteSettings } from "@/lib/settings";
import { whatsAppDigits } from "@/lib/whatsapp";
import { checkoutSchema, fieldErrors } from "@/lib/validators";
import { parseStringArray } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

export type CheckoutState = ActionState & {
  order?: { orderNumber: string; token: string };
};

class CheckoutError extends Error {}

function makeOrderNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `OMX-${y}${m}${d}-${suffix}`;
}

export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  let itemsRaw: unknown = [];
  try {
    itemsRaw = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    return { status: "error", message: "Your bag could not be read. Please try again." };
  }

  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || "",
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    notes: formData.get("notes") || "",
    items: itemsRaw,
    saveAddress: formData.get("saveAddress") === "on",
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const user = await getCurrentUser();
  const settings = await getSiteSettings();
  const { items, ...details } = parsed.data;

  if (!whatsAppDigits(settings.whatsapp)) {
    return {
      status: "error",
      message:
        "WhatsApp ordering is not configured right now. Please contact the store so we can take your order.",
    };
  }

  const productIds = Array.from(new Set(items.map((item) => item.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isPublished: true },
    include: { category: { select: { name: true } } },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  const lines: Array<{
    product: (typeof products)[number];
    quantity: number;
    variant: string;
    image: string;
  }> = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return {
        status: "error",
        message: "An item in your bag is no longer in the catalogue. Please review your bag.",
      };
    }

    if (product.status !== "AVAILABLE" || product.stock < 1) {
      return {
        status: "error",
        message: `${product.name} is not available right now. Remove it from your bag to continue.`,
      };
    }

    if (item.quantity > product.stock) {
      return {
        status: "error",
        message: `Only ${product.stock} of ${product.name} remain. Please update your quantity.`,
      };
    }

    const options = parseStringArray(product.variantOptions);
    let variant = item.variant?.trim() || "";
    if (product.variantLabel && options.length > 0) {
      if (!options.includes(variant)) {
        variant = options[0];
      }
    } else {
      variant = "";
    }

    const images = parseStringArray(product.images);
    lines.push({
      product,
      quantity: item.quantity,
      variant,
      image: images[0] || "",
    });
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );
  const shippingConfig = getShippingConfig();
  const shipping =
    subtotal >= shippingConfig.threshold ? 0 : shippingConfig.rate;
  const total = subtotal + shipping;
  const orderNumber = makeOrderNumber();
  const accessToken = randomBytes(24).toString("base64url");

  const shippingAddress = JSON.stringify({
    fullName: details.customerName,
    phone: details.phone,
    line1: details.line1,
    line2: details.line2 || "",
    city: details.city,
    state: details.state,
    pincode: details.pincode,
    email: details.email,
  });

  try {
    await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const updated = await tx.product.updateMany({
          where: {
            id: line.product.id,
            isPublished: true,
            status: "AVAILABLE",
            stock: { gte: line.quantity },
          },
          data: { stock: { decrement: line.quantity } },
        });

        if (updated.count !== 1) {
          throw new CheckoutError(
            `${line.product.name} just sold out. Please review your bag.`,
          );
        }

        await tx.product.updateMany({
          where: { id: line.product.id, stock: { lte: 0 } },
          data: { status: "OUT_OF_STOCK", stock: 0 },
        });
      }

      await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id ?? null,
          customerName: details.customerName,
          email: details.email,
          phone: details.phone,
          shippingAddress,
          subtotal,
          shipping,
          total,
          paymentMethod: "WHATSAPP",
          paymentStatus: "PENDING",
          status: "PENDING",
          accessToken,
          notes: details.notes || null,
          items: {
            create: lines.map((line) => ({
              productId: line.product.id,
              productName: line.product.name,
              variant: line.variant,
              sku: line.product.sku,
              price: line.product.price,
              quantity: line.quantity,
              image: line.image,
            })),
          },
        },
      });

      if (user) {
        await tx.cartItem.deleteMany({ where: { userId: user.id } });

        if (details.saveAddress) {
          const existingAddress = await tx.address.findFirst({
            where: {
              userId: user.id,
              line1: details.line1,
              pincode: details.pincode,
            },
            select: { id: true },
          });

          if (!existingAddress) {
            const count = await tx.address.count({ where: { userId: user.id } });
            if (count < 6) {
              await tx.address.create({
                data: {
                  userId: user.id,
                  label: "Delivery",
                  fullName: details.customerName,
                  phone: details.phone,
                  line1: details.line1,
                  line2: details.line2 || null,
                  city: details.city,
                  state: details.state,
                  pincode: details.pincode,
                  isDefault: count === 0,
                },
              });
            }
          }
        }
      }
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { status: "error", message: error.message };
    }
    console.error("Checkout failed:", error);
    return {
      status: "error",
      message:
        "We could not place your order. No payment has been taken. Please try again.",
    };
  }

  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/shop");

  return {
    status: "success",
    message: "Order saved. Continue on WhatsApp.",
    order: { orderNumber, token: accessToken },
  };
}
