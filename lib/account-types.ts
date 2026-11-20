export type AccountAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export type AccountOrderItem = {
  id: string;
  productName: string;
  variant: string;
  image: string;
  quantity: number;
  price: number;
};
