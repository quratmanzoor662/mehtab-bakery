import { redirect } from "next/navigation";

/** Legacy path — Orders module lives at /admin/orders */
export default function LegacyReservationsRedirect() {
  redirect("/admin/orders");
}
