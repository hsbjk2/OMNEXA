export type OrderAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
};

export function parseOrderAddress(raw: string): OrderAddress {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const value = (key: string) =>
      typeof parsed[key] === "string" ? (parsed[key] as string) : "";
    return {
      fullName: value("fullName"),
      phone: value("phone"),
      line1: value("line1"),
      line2: value("line2"),
      city: value("city"),
      state: value("state"),
      pincode: value("pincode"),
      email: value("email"),
    };
  } catch {
    return {
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      email: "",
    };
  }
}

export function orderStatusTone(status: string) {
  if (status === "DELIVERED") return "bg-[#e7f2e9] text-forest";
  if (status === "CANCELLED") return "bg-[#f3e4e4] text-wine";
  if (status === "SHIPPED" || status === "PACKED") {
    return "bg-light text-forest";
  }
  if (status === "CONFIRMED") return "bg-[#eaf1e4] text-forest";
  return "bg-[#f4efe1] text-[#6c5626]";
}

export function addressLines(address: OrderAddress) {
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.pincode].filter(Boolean).join(" "),
  ].filter(Boolean);
}
