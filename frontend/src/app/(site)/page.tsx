import { Hero } from "@/components/home/Hero";
import { TodaysAvailability } from "@/components/home/TodaysAvailability";
import { Story } from "@/components/home/Story";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { ProductGrid } from "@/components/home/ProductGrid";
import { Gallery } from "@/components/home/Gallery";
import { Reviews } from "@/components/home/Reviews";
import { Contact } from "@/components/home/Contact";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TodaysAvailability />
      <Story />
      <WhyChooseUs />
      <ProductGrid />
      <Gallery />
      <Reviews />
      <Contact />
      <div id="bulk-orders" />
    </main>
  );
}
