import { api } from "@/services/api";

export const RESERVATION_STATUSES = [
  "Pending",
  "Confirmed",
  "Ready for Pickup",
  "Collected",
  "Cancelled",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export type Reservation = {
  _id: string;
  reservation_number: string;
  customer: { name: string; phone: string };
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total_items: number;
  total_amount: number;
  pickup_date: string;
  pickup_time: string;
  notes?: string;
  status: ReservationStatus | string;
  whatsapp_sent?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ReservationsResponse = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  reservations: Reservation[];
};

export async function fetchReservations(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<ReservationsResponse>("/reservations/", {
    params,
  });
  return data;
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
) {
  const { data } = await api.patch<Reservation>(
    `/reservations/${id}/status`,
    { status },
  );
  return data;
}
