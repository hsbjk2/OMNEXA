export type StoreUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: string | null;
  phone: string | null;
  image: string | null;
  createdAt: string;
};

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  stock: number;
  status: string;
  quantity: number;
  variant: string;
};

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};
