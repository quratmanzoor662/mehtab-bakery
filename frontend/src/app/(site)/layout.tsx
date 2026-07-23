import { Navbar } from "@/components/layout/Navbar";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { ReservationShell } from "@/features/reservation/ReservationShell";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReservationShell>
      <Navbar />
      {/* Extra bottom space so Call/WhatsApp FABs don't cover Contact CTAs */}
      <div className="pb-28 sm:pb-24">{children}</div>
      <FloatingActions />
    </ReservationShell>
  );
}
