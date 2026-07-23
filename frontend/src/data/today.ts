import type { ProductId } from "@/types/product";

/**
 * Single source of truth for today's bakery board.
 * Flip values here to update availability & stock site-wide.
 */
export const todayBoard = {
  availability: {
    girda: true,
    kulcha: true,
    bakirkhani: false,
    tailwoor: true,
  } satisfies Record<ProductId, boolean>,

  /** Remaining pieces for the day. Used for urgency badges. */
  stock: {
    girda: 18,
    kulcha: 8,
    bakirkhani: 0,
    tailwoor: 4,
  } satisfies Record<ProductId, number>,

  /** Reservation window (local time). */
  reservation: {
    opensAtHour: 5,
    closesAtHour: 19,
  },
} as const;

export type TodayBoard = typeof todayBoard;

export function isAvailable(id: ProductId) {
  return todayBoard.availability[id] && todayBoard.stock[id] > 0;
}

export function getStock(id: ProductId) {
  return todayBoard.stock[id];
}

export type StockUrgency = {
  label: string;
  tone: "ok" | "warn" | "critical" | "soldout";
} | null;

export function getStockUrgency(id: ProductId): StockUrgency {
  if (!todayBoard.availability[id] || todayBoard.stock[id] <= 0) {
    return { label: "Sold Out", tone: "soldout" };
  }
  const left = todayBoard.stock[id];
  if (left < 5) {
    return { label: left <= 2 ? "Last Batch" : `Only ${left} left today`, tone: "critical" };
  }
  if (left < 10) {
    return { label: left <= 7 ? "Selling Fast" : `Only ${left} left today`, tone: "warn" };
  }
  return null;
}

export function isReservationWindowOpen(now = new Date()) {
  const { opensAtHour, closesAtHour } = todayBoard.reservation;
  const hour = now.getHours();
  return hour >= opensAtHour && hour < closesAtHour;
}
