import type { CartItem, CustomerDetails, ReservationDraft } from "@/types/reservation";
import {
  BULK_THRESHOLD,
  PRODUCT_MAP,
  WHATSAPP_NUMBER,
} from "@/constants/products";

/** Primary draft key used by the app. */
export const RESERVATION_STORAGE_KEY = "mehtab-bakery-reservation";

/** Legacy / alternate keys that must also be wiped on confirm. */
export const RESERVATION_STORAGE_KEYS = [
  RESERVATION_STORAGE_KEY,
  "reservation",
  "reservationItems",
  "reservationCustomer",
  "reservationStatus",
] as const;

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
    const draft = JSON.parse(raw) as ReservationDraft;
    // Confirmed / awaiting drafts are never restored — treat as empty.
    if (!draft?.items?.length || draft.status === "awaiting_whatsapp") {
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function saveReservationDraft(draft: ReservationDraft) {
  if (typeof window === "undefined") return;
  // Never persist post-confirm status.
  if (draft.status === "awaiting_whatsapp" || draft.items.length === 0) {
    clearAllReservationStorage();
    return;
  }
  window.localStorage.setItem(
    RESERVATION_STORAGE_KEY,
    JSON.stringify({ ...draft, status: "draft" }),
  );
}

export function clearAllReservationStorage() {
  if (typeof window === "undefined") return;

  for (const key of RESERVATION_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

/** @deprecated Prefer clearAllReservationStorage */
export function clearReservationDraft() {
  clearAllReservationStorage();
}

export function todayDateInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

/** Local calendar date for tomorrow (YYYY-MM-DD). */
export function tomorrowDateInputValue() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}
