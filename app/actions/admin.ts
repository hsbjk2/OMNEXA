"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  categoryAdminSchema,
  fieldErrors,
  productAdminSchema,
  settingsAdminSchema,
} from "@/lib/validators";
import { isAllowedImageSource, isValidHttpUrl, slugify } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

async function isAdminUser() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

const denied: ActionState = {
  status: "error",
  message: "You do not have permission to perform that action.",
};

function cleanUrlList(raw: string): string[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const values = parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
    if (values.length < 1 || values.length > 8) return null;
    const valid = values.every((value) => isAllowedImageSource(value));
    return valid ? values : null;
  } catch {
    return null;
  }
}

export async function saveProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdminUser())) return denied;

  const images = cleanUrlList(String(formData.get("images") || "[]"));
  if (!images) {
    return {
      status: "error",
      errors: { images: "Add between 1 and 8 valid image uploads or Pexels/Unsplash URLs." },
    };
  }

  const parsed = productAdminSchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || "",
    description: formData.get("description"),
    details: formData.get("details") || "",
    categoryId: formData.get("categoryId"),
    images,
    price: formData.get("price"),
    originalPrice: formData.get("originalPrice") || undefined,
    sku: formData.get("sku"),
    stock: formData.get("stock"),
    status: formData.get("status"),
    isFeatured: formData.get("isFeatured") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isNewArrival: formData.get("isNewArrival") === "on",
    isPublished: formData.get("isPublished") === "on",
    isDemo: formData.get("isDemo") === "on",
    variantLabel: formData.get("variantLabel") || "",
    variantOptions: formData.get("variantOptions") || "",
    amazonUrl: formData.get("amazonUrl") || "",
    flipkartUrl: formData.get("flipkartUrl") || "",
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.name);
  if (!slug) {
    return { status: "error", errors: { slug: "Enter a valid product slug." } };
  }

  if (data.status !== "COMING_SOON" && data.price < 1) {
    return {
      status: "error",
      errors: { price: "Available products need a price." },
    };
  }

  if (data.originalPrice !== undefined && data.originalPrice > 0 && data.originalPrice < data.price) {
    return {
      status: "error",
      errors: { originalPrice: "Original price should be higher than the sale price." },
    };
  }

  const duplicate = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { sku: data.sku }],
      ...(data.id ? { NOT: { id: data.id } } : {}),
    },
    select: { id: true, slug: true, sku: true },
  });

  if (duplicate) {
    return {
      status: "error",
      errors:
        duplicate.slug === slug
          ? { slug: "That slug is already in use." }
          : { sku: "That SKU is already in use." },
    };
  }

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { id: true },
  });
  if (!category) {
    return { status: "error", errors: { categoryId: "Choose a valid category." } };
  }

  const variantOptions = data.variantLabel
    ? (data.variantOptions || "")
        .split(/[,\n]/)
        .map((option) => option.trim())
        .filter(Boolean)
        .slice(0, 12)
    : [];

  const status =
    data.status === "COMING_SOON"
      ? "COMING_SOON"
      : data.stock < 1
        ? "OUT_OF_STOCK"
        : data.status;

  const payload = {
    name: data.name,
    slug,
    description: data.description,
    details: data.details || null,
    categoryId: data.categoryId,
    images: JSON.stringify(images),
    price: data.price,
    originalPrice: data.originalPrice && data.originalPrice > 0 ? data.originalPrice : null,
    sku: data.sku,
    stock: status === "COMING_SOON" ? 0 : data.stock,
    status,
    isFeatured: data.isFeatured,
    isBestSeller: data.isBestSeller,
    isNewArrival: data.isNewArrival,
    isPublished: data.isPublished,
    isDemo: data.isDemo,
    variantLabel: data.variantLabel || null,
    variantOptions: variantOptions.length
      ? JSON.stringify(variantOptions)
      : null,
    amazonUrl: data.amazonUrl?.trim() || null,
    flipkartUrl: data.flipkartUrl?.trim() || null,
  };

  if (data.id) {
    await prisma.product.update({ where: { id: data.id }, data: payload });
  } else {
    await prisma.product.create({ data: payload });
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/new-arrivals");
  revalidatePath("/coming-soon");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/admin/products");
  revalidatePath("/admin");

  redirect(`/admin/products?notice=${data.id ? "updated" : "created"}`);
}

export async function deleteProductAction(formData: FormData) {
  if (!(await isAdminUser())) redirect("/login?next=/admin");
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.product.deleteMany({ where: { id } });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  redirect("/admin/products?notice=deleted");
}

const allowedFlags = ["isFeatured", "isBestSeller", "isNewArrival", "isPublished"] as const;
type Flag = (typeof allowedFlags)[number];

export async function toggleProductFlagAction(formData: FormData) {
  if (!(await isAdminUser())) redirect("/login?next=/admin");
  const id = formData.get("id");
  const flag = formData.get("flag");

  if (
    typeof id !== "string" ||
    typeof flag !== "string" ||
    !allowedFlags.includes(flag as Flag)
  ) {
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { isFeatured: true, isBestSeller: true, isNewArrival: true, isPublished: true },
  });
  if (!product) return;

  await prisma.product.update({
    where: { id },
    data: { [flag]: !product[flag as Flag] },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

export async function saveCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdminUser())) return denied;

  const parsed = categoryAdminSchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || "",
    description: formData.get("description"),
    image: formData.get("image"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.name);
  if (!slug) {
    return { status: "error", errors: { slug: "Enter a valid category slug." } };
  }

  if (!isAllowedImageSource(data.image)) {
    return { status: "error", errors: { image: "Enter a valid local image path or an approved image URL." } };
  }

  const duplicate = await prisma.category.findFirst({
    where: { slug, ...(data.id ? { NOT: { id: data.id } } : {}) },
    select: { id: true },
  });
  if (duplicate) {
    return { status: "error", errors: { slug: "That category slug is already in use." } };
  }

  const payload = {
    name: data.name,
    slug,
    description: data.description,
    image: data.image,
    sortOrder: data.sortOrder,
  };

  if (data.id) {
    await prisma.category.update({ where: { id: data.id }, data: payload });
  } else {
    await prisma.category.create({ data: payload });
  }

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  redirect("/admin/categories?status=saved");
}

export async function deleteCategoryAction(formData: FormData) {
  if (!(await isAdminUser())) redirect("/login?next=/admin");
  const id = formData.get("id");
  if (typeof id !== "string") return;

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    redirect("/admin/categories?status=has-products");
  }

  await prisma.category.deleteMany({ where: { id } });
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  redirect("/admin/categories?status=deleted");
}


export async function markMessageHandledAction(formData: FormData) {
  if (!(await isAdminUser())) redirect("/login?next=/admin");
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.contactMessage.update({
    where: { id },
    data: { status: "HANDLED" },
  });
  revalidatePath("/admin/audience");
}

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdminUser())) return denied;

  const parsed = settingsAdminSchema.safeParse({
    businessName: formData.get("businessName"),
    addressLine1: formData.get("addressLine1") || "",
    addressLine2: formData.get("addressLine2") || "",
    city: formData.get("city") || "",
    state: formData.get("state") || "",
    pincode: formData.get("pincode") || "",
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone") || "",
    whatsapp: formData.get("whatsapp") || "",
    mapEmbedUrl: formData.get("mapEmbedUrl") || "",
    mapLink: formData.get("mapLink") || "",
    googleBusinessUrl: formData.get("googleBusinessUrl") || "",
    whatsappChannelUrl: formData.get("whatsappChannelUrl") || "",
    instagramUrl: formData.get("instagramUrl") || "",
    facebookUrl: formData.get("facebookUrl") || "",
    amazonUrl: formData.get("amazonUrl") || "",
    flipkartUrl: formData.get("flipkartUrl") || "",
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const urlFields = [
    "mapEmbedUrl",
    "mapLink",
    "googleBusinessUrl",
    "whatsappChannelUrl",
    "instagramUrl",
    "facebookUrl",
    "amazonUrl",
    "flipkartUrl",
  ] as const;

  for (const field of urlFields) {
    const value = data[field];
    if (value && !isValidHttpUrl(value)) {
      return {
        status: "error",
        errors: { [field]: "Enter a complete URL beginning with https://" },
      };
    }
  }

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: data,
    create: { id: "site", ...data },
  });

  revalidatePath("/", "layout");
  return { status: "success", message: "Business settings saved." };
}
