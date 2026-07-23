import { api } from "@/services/api";

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Collected",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type StatusHistoryEntry = {
  status: string;
  time: string;
};

export type Order = {
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
  status: OrderStatus | string;
  status_history?: StatusHistoryEntry[];
  whatsapp_sent?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type OrdersResponse = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  reservations: Order[];
};

export type OrdersQuery = {
  status?: string;
  search?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
};

/** Next status buttons for the bakery kitchen workflow. */
export const ORDER_ACTIONS: Record<
  string,
  { label: string; next: OrderStatus; tone: string }[]
> = {
  Pending: [
    {
      label: "Confirm",
      next: "Confirmed",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    {
      label: "Cancel",
      next: "Cancelled",
      tone: "border-red-200 bg-red-50 text-red-700",
    },
  ],
  Confirmed: [
    {
      label: "Preparing",
      next: "Preparing",
      tone: "border-amber-200 bg-amber-50 text-amber-900",
    },
    {
      label: "Cancel",
      next: "Cancelled",
      tone: "border-red-200 bg-red-50 text-red-700",
    },
  ],
  Preparing: [
    {
      label: "Ready",
      next: "Ready",
      tone: "border-sky-200 bg-sky-50 text-sky-800",
    },
    {
      label: "Cancel",
      next: "Cancelled",
      tone: "border-red-200 bg-red-50 text-red-700",
    },
  ],
  Ready: [
    {
      label: "Collected",
      next: "Collected",
      tone: "border-violet-200 bg-violet-50 text-violet-800",
    },
  ],
};

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "Pending":
      return "bg-amber-100 text-amber-900";
    case "Confirmed":
      return "bg-emerald-100 text-emerald-900";
    case "Preparing":
      return "bg-orange-100 text-orange-900";
    case "Ready":
    case "Ready for Pickup":
      return "bg-sky-100 text-sky-900";
    case "Collected":
      return "bg-stone-200 text-stone-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-[#F3E7DA] text-[#6B5344]";
  }
}

export async function fetchOrders(params?: OrdersQuery) {
  const { data } = await api.get<OrdersResponse>("/reservations/", { params });
  return data;
}

export async function fetchOrder(idOrNumber: string) {
  const { data } = await api.get<Order>(
    `/reservations/${encodeURIComponent(idOrNumber)}`,
  );
  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data } = await api.patch<Order>(`/reservations/${id}/status`, {
    status,
  });
  return data;
}
