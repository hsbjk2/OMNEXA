import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pieces saved in your OMNEXA bag.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartView />;
}
