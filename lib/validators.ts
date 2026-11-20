import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "That email address is too long.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(80, "Use 80 characters or fewer."),
  email,
  password,
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  email,
  token: z.string().min(10, "This reset link is missing or invalid."),
  password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: password,
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(80, "Use 80 characters or fewer."),
  phone: z
    .string()
    .trim()
    .max(20, "Use 20 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export const addressSchema = z.object({
  id: z.string().optional(),
  label: z
    .string()
    .trim()
    .min(1, "Add a label for this address.")
    .max(30, "Use 30 characters or fewer."),
  fullName: z
    .string()
    .trim()
    .min(2, "Enter the recipient's full name.")
    .max(80, "Use 80 characters or fewer."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(20, "Use 20 characters or fewer.")
    .regex(/^[+0-9()\-\s]+$/, "Use digits and standard phone symbols only."),
  line1: z
    .string()
    .trim()
    .min(4, "Enter the street address.")
    .max(120, "Use 120 characters or fewer."),
  line2: z.string().trim().max(120, "Use 120 characters or fewer.").optional(),
  city: z
    .string()
    .trim()
    .min(2, "Enter the city.")
    .max(60, "Use 60 characters or fewer."),
  state: z
    .string()
    .trim()
    .min(2, "Enter the state.")
    .max(60, "Use 60 characters or fewer."),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code."),
  isDefault: z.boolean().optional().default(false),
});

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Enter the recipient's full name.")
    .max(80, "Use 80 characters or fewer."),
  email,
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(20, "Use 20 characters or fewer.")
    .regex(/^[+0-9()\-\s]+$/, "Use digits and standard phone symbols only."),
  line1: z
    .string()
    .trim()
    .min(4, "Enter the street address.")
    .max(120, "Use 120 characters or fewer."),
  line2: z.string().trim().max(120, "Use 120 characters or fewer.").optional(),
  city: z.string().trim().min(2, "Enter the city.").max(60),
  state: z.string().trim().min(2, "Enter the state.").max(60),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code."),
  notes: z.string().trim().max(400, "Use 400 characters or fewer.").optional(),
  paymentMethod: z.literal("COD"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
        variant: z.string().max(80).optional().default(""),
      }),
    )
    .min(1, "Your bag is empty.")
    .max(50),
  saveAddress: z.boolean().optional().default(false),
});

export const newsletterSchema = z.object({
  email,
});

export const waitlistSchema = z.object({
  email,
  productId: z.string().min(1),
});

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(80, "Use 80 characters or fewer."),
  email,
  phone: z
    .string()
    .trim()
    .max(20, "Use 20 characters or fewer.")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, "Add a short subject.")
    .max(120, "Use 120 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more.")
    .max(2000, "Use 2,000 characters or fewer."),
  type: z.enum(["GENERAL", "WHOLESALE"]).default("GENERAL"),
});

export const searchQuerySchema = z.string().trim().max(80);

export const productAdminSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Enter a product name.").max(120),
  slug: z.string().trim().max(140).optional(),
  description: z
    .string()
    .trim()
    .min(20, "Write at least a short description.")
    .max(4000),
  details: z.string().trim().max(4000).optional(),
  categoryId: z.string().min(1, "Choose a category."),
  images: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one product image."),
  price: z.coerce.number().int().min(0, "Price cannot be negative."),
  originalPrice: z.coerce.number().int().min(0).optional(),
  sku: z.string().trim().min(2, "Enter a SKU.").max(64),
  stock: z.coerce.number().int().min(0),
  status: z.enum(["AVAILABLE", "OUT_OF_STOCK", "COMING_SOON"]),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  isDemo: z.boolean().default(false),
  variantLabel: z.string().trim().max(40).optional(),
  variantOptions: z.string().trim().max(400).optional(),
});

export const categoryAdminSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Enter a category name.").max(80),
  slug: z.string().trim().max(100).optional(),
  description: z
    .string()
    .trim()
    .min(10, "Write a short category description.")
    .max(500),
  image: z.string().trim().min(1, "Add a category image."),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const settingsAdminSchema = z.object({
  businessName: z.string().trim().min(1).max(80),
  addressLine1: z.string().trim().max(160).optional().or(z.literal("")),
  addressLine2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  pincode: z
    .string()
    .trim()
    .max(10)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^[0-9]{4,10}$/.test(value), "Enter a valid PIN code."),
  contactEmail: email,
  contactPhone: z.string().trim().max(24).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(24).optional().or(z.literal("")),
  mapEmbedUrl: z.string().trim().max(2000).optional().or(z.literal("")),
  mapLink: z.string().trim().max(2000).optional().or(z.literal("")),
  googleBusinessUrl: z.string().trim().max(2000).optional().or(z.literal("")),
  whatsappChannelUrl: z.string().trim().max(500).optional().or(z.literal("")),
  instagramUrl: z.string().trim().max(500).optional().or(z.literal("")),
  facebookUrl: z.string().trim().max(500).optional().or(z.literal("")),
  amazonUrl: z.string().trim().max(500).optional().or(z.literal("")),
  flipkartUrl: z.string().trim().max(500).optional().or(z.literal("")),
});

export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
