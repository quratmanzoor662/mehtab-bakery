import type { CartItem, CustomerDetails, ReservationDraft } from "@/types/reservation";
import {
  BULK_THRESHOLD,
  PRODUCT_MAP,
  WHATSAPP_NUMBER,
} from "@/constants/products";

export const RESERVATION_STORAGE_KEY = "mehtab-bakery-reservation";

export const EMPTY_CUSTOMER: CustomerDetails = {
  name: "",
  phone: "",
  pickupDate: "",
  pickupTime: "",
  notes: "",
};

export function getCartTotals(items: CartItem[]) {
  const pieceCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const product = PRODUCT_MAP[item.productId];
    return sum + product.price * item.quantity;
  }, 0);

  return {
    pieceCount,
    subtotal,
    isBulk: pieceCount > BULK_THRESHOLD,
    itemCount: items.length,
  };
}

export function buildWhatsAppMessage(
  items: CartItem[],
  customer: CustomerDetails,
): string {
  const { pieceCount, subtotal, isBulk } = getCartTotals(items);
  const lines = [
    "🍞 *Mehtab Bakery — Bread Reservation*",
    "",
    "*Order*",
    ...items.map((item) => {
      const product = PRODUCT_MAP[item.productId];
      return `• ${product.name} × ${item.quantity} (₹${product.price} each)`;
    }),
    "",
    `*Total pieces:* ${pieceCount}`,
    `*Estimated total:* ₹${subtotal}`,
  ];

  if (isBulk) {
    lines.push(
      "",
      `_Bulk order (over ${BULK_THRESHOLD} pieces) — please confirm pricing on WhatsApp._`,
    );
  }

  lines.push(
    "",
    "*Customer*",
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Pickup: ${customer.pickupDate} at ${customer.pickupTime}`,
  );

  if (customer.notes.trim()) {
    lines.push(`Notes: ${customer.notes.trim()}`);
  }

  lines.push("", "Please confirm this reservation. Thank you!");

  return lines.join("\n");
}

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function loadReservationDraft(): ReservationDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RESERVATION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReservationDraft;
  } catch {
    return null;
  }
}

export function saveReservationDraft(draft: ReservationDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify(draft));
}

export function clearReservationDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RESERVATION_STORAGE_KEY);
}

export function todayDateInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}
