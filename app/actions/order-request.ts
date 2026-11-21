"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getShippingConfig } from "@/lib/shipping";
import { getSiteSettings } from "@/lib/settings";
import { absoluteUrl, parseStringArray } from "@/lib/utils";
import {
  buildCartEnquiryHref,
  isWhatsAppConfigured,
} from "@/lib/whatsapp";
import { fieldErrors, orderRequestSchema } from "@/lib/validators";
import type { ActionState } from "@/lib/action-state";

export type OrderRequestState = ActionState & {
  whatsappUrl?: string;
  summary?: {
    itemCount: number;
    subtotal: number;
    shipping: number;
    total: number;
  };
};

function imageUrlForMessage(image: string) {
  const value = image.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return absoluteUrl(value);
  return null;
}

export async function prepareOrderEnquiryAction(
  _prev: OrderRequestState,
  formData: FormData,
): Promise<OrderRequestState> {
  let itemsRaw: unknown = [];
  try {
    itemsRaw = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    return {
      status: "error",
      message: "Your bag could not be read. Please refresh the page and try again.",
    };
  }

  const parsed = orderRequestSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || "",
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    notes: formData.get("notes") || "",
    items: itemsRaw,
    saveAddress: formData.get("saveAddress") === "on",
    acknowledgement: formData.get("acknowledgement") === "on",
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  if (!parsed.data.acknowledgement) {
    return {
      status: "error",
      errors: {
        acknowledgement:
          "Please confirm that this is an enquiry and the seller will confirm the final details.",
      },
    };
  }

  const [user, settings] = await Promise.all([
    getCurrentUser(),
    getSiteSettings(),
  ]);

  if (!isWhatsAppConfigured(settings.whatsapp)) {
    return {
      status: "error",
      message:
        "WhatsApp enquiries are not configured right now. Please use the contact page and we will help you directly.",
    };
  }

  const details = parsed.data;
  const productIds = Array.from(
    new Set(details.items.map((item) => item.productId)),
  );
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isPublished: true },
    include: { category: { select: { name: true } } },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  const lines: Array<{
    name: string;
    variant: string;
    quantity: number;
    unitPrice: number;
    productUrl: string;
    imageUrl: string | null;
  }> = [];

  for (const item of details.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return {
        status: "error",
        message:
          "An item in your bag is no longer in the catalogue. Please review your bag and try again.",
      };
    }

    if (product.status !== "AVAILABLE" || product.stock < 1) {
      return {
        status: "error",
        message: `${product.name} is not available right now. Please remove it from your bag to continue.`,
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
      name: product.name,
      variant,
      quantity: item.quantity,
      unitPrice: product.price,
      productUrl: absoluteUrl(`/product/${product.slug}`),
      imageUrl: imageUrlForMessage(images[0] || ""),
    });
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const shippingConfig = getShippingConfig();
  const shipping =
    subtotal >= shippingConfig.threshold ? 0 : shippingConfig.rate;
  const total = subtotal + shipping;

  const whatsappUrl = buildCartEnquiryHref(settings.whatsapp, {
    customerName: details.customerName,
    phone: details.phone,
    line1: details.line1,
    line2: details.line2 || null,
    city: details.city,
    state: details.state,
    pincode: details.pincode,
    notes: details.notes || null,
    items: lines,
    subtotal,
    shipping,
    total,
  });

  if (!whatsappUrl) {
    return {
      status: "error",
      message:
        "WhatsApp enquiries are not configured right now. Please use the contact page and we will help you directly.",
    };
  }

  if (user && details.saveAddress) {
    try {
      const existingAddress = await prisma.address.findFirst({
        where: {
          userId: user.id,
          line1: details.line1,
          pincode: details.pincode,
        },
        select: { id: true },
      });

      if (!existingAddress) {
        const count = await prisma.address.count({
          where: { userId: user.id },
        });
        if (count < 6) {
          await prisma.address.create({
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
          revalidatePath("/account");
          revalidatePath("/account/addresses");
          revalidatePath("/order-request");
        }
      }
    } catch (error) {
      // Saving an address is a convenience. It must never block the enquiry.
      console.error("Could not save delivery address:", error);
    }
  }

  return {
    status: "success",
    message: "Your WhatsApp message is ready.",
    whatsappUrl,
    summary: {
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      shipping,
      total,
    },
  };
}
