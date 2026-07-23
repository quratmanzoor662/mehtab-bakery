import { api } from "@/services/api";

export type BakerySettings = {
  shop_open: boolean;
  business_hours: { open: string; close: string };
  friday_break: { start: string; end: string };
  today_message: string;
  phone_number: string;
  whatsapp_number: string;
  address: string;
  google_maps_url: string;
  instagram: string;
  facebook: string;
  temporary_closed: boolean;
  closure_reason: string;
  closure_message: string;
  allow_future_orders: boolean;
  /** ISO datetime string or null */
  reopen_date: string | null;
};

export async function fetchSettings() {
  const { data } = await api.get<BakerySettings>("/settings/");
  return data;
}

export async function updateSettings(payload: Partial<BakerySettings>) {
  const { data } = await api.put<BakerySettings>("/settings/", payload);
  return data;
}

/** True when the bakery is in a temporary closure (holiday / emergency). */
export function isTemporarilyClosed(settings: BakerySettings | null | undefined) {
  return Boolean(settings?.temporary_closed);
}

/**
 * Customers can still place orders when closed only if future orders are allowed
 * (e.g. reserve for tomorrow during Eid).
 */
export function canAcceptOrders(settings: BakerySettings | null | undefined) {
  if (!settings) return true;
  if (!settings.temporary_closed) return true;
  return Boolean(settings.allow_future_orders);
}

export function forcesFuturePickup(settings: BakerySettings | null | undefined) {
  return isTemporarilyClosed(settings) && Boolean(settings?.allow_future_orders);
}
