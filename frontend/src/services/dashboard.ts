import { api } from "@/services/api";

export type DashboardSummary = {
  date: string;
  today_orders: number;
  today_revenue: number;
  pending_orders: number;
  confirmed_orders: number;
  preparing_orders: number;
  ready_orders: number;
  collected_orders: number;
  cancelled_orders: number;
  products: number;
  available_products: number;
  sold_out_products: number;
};

export type RecentOrder = {
  id: string;
  reservation_number: string;
  customer: string;
  phone?: string;
  status: string;
  total_amount: number;
  pickup_date?: string;
  pickup_time?: string;
};

export type DashboardResponse = {
  summary: DashboardSummary;
  recent_orders: RecentOrder[];
};

export async function fetchDashboard() {
  const { data } = await api.get<DashboardResponse>("/dashboard/");
  return data;
}
