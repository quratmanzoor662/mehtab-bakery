import type { ProductId } from "@/types/product";

export type ReservationStep = "cart" | "details" | "confirm";

export type ReservationStatus = "draft" | "awaiting_whatsapp";

export type CartItem = {
  productId: ProductId;
  quantity: number;
};

export type CustomerDetails = {
  name: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  notes: string;
};

export type ReservationDraft = {
  items: CartItem[];
  customer: CustomerDetails;
  status: ReservationStatus;
  step: ReservationStep;
  updatedAt: string;
};
